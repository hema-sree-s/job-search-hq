const { getRedis, getJSON } = require("../../lib/redis");
const { sendEmail, emailConfigured } = require("../../lib/email");

// Runs once a day via Vercel Cron (see vercel.json -- 13:30 UTC, i.e. morning
// in US timezones; adjust the schedule there if needed). Sends AT MOST ONE
// email per account per day, combining everything into a single digest:
//   - application deadlines that are overdue, due today, or due tomorrow
//   - unfinished items on the user's Today and This Week to-do lists
// If a user has nothing pending at all, no email is sent that day.
// Optional: set CRON_SECRET in Vercel to lock this endpoint down.

function parseMaybe(v, fallback) {
  if (v === null || v === undefined) return fallback;
  if (typeof v === "string") { try { return JSON.parse(v); } catch (e) { return fallback; } }
  return v;
}

module.exports = async (req, res) => {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  if (!emailConfigured()) {
    return res.status(200).json({ ok: false, skipped: "email not configured" });
  }

  try {
    const redis = getRedis();
    const userIds = (await redis.smembers("users:index")) || [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    let sent = 0;

    for (const userId of userIds) {
      const user = await getJSON(redis, `user:${userId}`);
      if (!user || !user.email) continue;

      // Hard guarantee: at most one email per account per day.
      const guardKey = `notif:${userId}:${todayStr}`;
      if (await redis.get(guardKey)) continue;

      const jobs = parseMaybe(await getJSON(redis, `blob:jobs:${userId}`), []);
      const todos = parseMaybe(await getJSON(redis, `blob:todos:${userId}`), {});

      const due = (Array.isArray(jobs) ? jobs : [])
        .filter((j) => j.deadline && j.status !== "rejected" && j.status !== "offer")
        .map((j) => ({ j, days: Math.round((new Date(j.deadline + "T00:00:00") - today) / 86400000) }))
        .filter((x) => x.days <= 1)
        .sort((a, b) => a.days - b.days);

      const dailyPending = ((todos && todos.daily) || []).filter((t) => !t.done);
      const weeklyPending = ((todos && todos.weekly) || []).filter((t) => !t.done);

      if (due.length === 0 && dailyPending.length === 0 && weeklyPending.length === 0) continue;

      const sections = [];
      if (due.length) {
        const line = (x) => {
          const when = x.days < 0 ? `OVERDUE by ${-x.days} day(s)` : x.days === 0 ? "due TODAY" : "due tomorrow";
          return `<li><b>${x.j.role}</b> at <b>${x.j.company}</b> — ${when} (${x.j.deadline})</li>`;
        };
        sections.push(`<h3 style="margin-bottom:4px">Application deadlines</h3><ul>${due.map(line).join("")}</ul>`);
      }
      if (dailyPending.length) {
        sections.push(`<h3 style="margin-bottom:4px">Today's to-dos</h3><ul>${dailyPending.map((t) => `<li>${t.text}</li>`).join("")}</ul>`);
      }
      if (weeklyPending.length) {
        sections.push(`<h3 style="margin-bottom:4px">This week</h3><ul>${weeklyPending.map((t) => `<li>${t.text}</li>`).join("")}</ul>`);
      }

      const result = await sendEmail({
        to: user.email,
        subject: "Your day ahead — Job Search HQ",
        html: `<p>Good morning, ${user.username}!</p>${sections.join("")}<p>Open Job Search HQ to check things off.</p>`,
      });
      if (result.ok) {
        sent += 1;
        await redis.set(guardKey, "1", { ex: 172800 });
      }
    }

    res.status(200).json({ ok: true, usersChecked: userIds.length, emailsSent: sent });
  } catch (e) {
    res.status(500).json({ error: e.message || "Cron failed" });
  }
};