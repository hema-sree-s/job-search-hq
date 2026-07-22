const { getRedis, getJSON } = require("../../lib/redis");
const { sendEmail, emailConfigured } = require("../../lib/email");

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
    const dayName = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    let sent = 0;

    for (const userId of userIds) {
      const user = await getJSON(redis, `user:${userId}`);
      if (!user || !user.email) continue;

      // Hard guarantee: one email per account per day
      const guardKey = `notif:${userId}:${todayStr}`;
      if (await redis.get(guardKey)) continue;

      const jobs   = parseMaybe(await getJSON(redis, `blob:jobs:${userId}`), []);
      const todos  = parseMaybe(await getJSON(redis, `blob:todos:${userId}`), {});

      // ---- Applications summary ----
      const allJobs = Array.isArray(jobs) ? jobs : [];
      const activeJobs = allJobs.filter((j) => j.status !== "rejected" && j.status !== "offer");
      const byStage = {
        saved: allJobs.filter((j) => j.status === "saved").length,
        applied: allJobs.filter((j) => j.status === "applied").length,
        interview: allJobs.filter((j) => j.status === "interview").length,
        offer: allJobs.filter((j) => j.status === "offer").length,
        rejected: allJobs.filter((j) => j.status === "rejected").length,
      };

      // Deadlines: overdue, today, tomorrow
      const deadlines = activeJobs
        .filter((j) => j.deadline)
        .map((j) => ({ j, days: Math.round((new Date(j.deadline + "T00:00:00") - today) / 86400000) }))
        .filter((x) => x.days <= 1)
        .sort((a, b) => a.days - b.days);

      // ---- To-do summary ----
      const daily   = (todos.daily  || []);
      const weekly  = (todos.weekly || []);
      const dailyDone    = daily.filter((t) => t.done);
      const dailyPending = daily.filter((t) => !t.done);
      const weeklyDone    = weekly.filter((t) => t.done);
      const weeklyPending = weekly.filter((t) => !t.done);

      // Only send if there's something worth saying
      const hasContent = deadlines.length || dailyPending.length || weeklyPending.length || allJobs.length;
      if (!hasContent) continue;

      // ---- Build email HTML ----
      const dlSection = deadlines.length ? `
        <h3 style="color:#C97056;margin:16px 0 6px">⚠️ Deadlines needing attention</h3>
        <ul style="margin:0;padding-left:20px">
          ${deadlines.map(({ j, days }) => {
            const when = days < 0 ? `<b style="color:#C97056">OVERDUE by ${-days} day(s)</b>` : days === 0 ? `<b style="color:#C97056">due TODAY</b>` : `due tomorrow`;
            return `<li>${j.role} at <b>${j.company}</b> — ${when} (${j.deadline})</li>`;
          }).join("")}
        </ul>` : "";

      const appSection = `
        <h3 style="color:#3D3752;margin:16px 0 6px">📋 Your application pipeline</h3>
        <table style="border-collapse:collapse;font-size:13px">
          <tr><td style="padding:3px 12px 3px 0;color:#9791AC">Saved/bookmarked</td><td><b>${byStage.saved}</b></td></tr>
          <tr><td style="padding:3px 12px 3px 0;color:#9791AC">Applied</td><td><b>${byStage.applied}</b></td></tr>
          <tr><td style="padding:3px 12px 3px 0;color:#9791AC">In interviews</td><td><b>${byStage.interview}</b></td></tr>
          <tr><td style="padding:3px 12px 3px 0;color:#4E9C6E">Offers</td><td><b>${byStage.offer}</b></td></tr>
          <tr><td style="padding:3px 12px 3px 0;color:#9791AC">Rejected</td><td><b>${byStage.rejected}</b></td></tr>
          <tr style="border-top:1px solid #E7E1F5"><td style="padding:6px 12px 3px 0;color:#3D3752">Total</td><td><b>${allJobs.length}</b></td></tr>
        </table>`;

      const todoTodaySection = daily.length ? `
        <h3 style="color:#3D3752;margin:16px 0 6px">✅ Today's tasks</h3>
        ${dailyDone.length ? `
          <p style="margin:4px 0;color:#9791AC;font-size:12px">Completed yesterday:</p>
          <ul style="margin:0 0 8px;padding-left:20px;color:#9791AC">
            ${dailyDone.map((t) => `<li style="text-decoration:line-through">${t.text}</li>`).join("")}
          </ul>` : ""}
        ${dailyPending.length ? `
          <p style="margin:4px 0;color:#3D3752;font-size:12px">To do today:</p>
          <ul style="margin:0;padding-left:20px">
            ${dailyPending.map((t) => `<li>${t.text}</li>`).join("")}
          </ul>` : `<p style="color:#4E9C6E;margin:4px 0">✓ All daily tasks completed!</p>`}
        ` : "";

      const todoWeekSection = weekly.length ? `
        <h3 style="color:#3D3752;margin:16px 0 6px">📅 This week</h3>
        ${weeklyDone.length ? `
          <p style="margin:4px 0;color:#9791AC;font-size:12px">Done this week:</p>
          <ul style="margin:0 0 8px;padding-left:20px;color:#9791AC">
            ${weeklyDone.map((t) => `<li style="text-decoration:line-through">${t.text}</li>`).join("")}
          </ul>` : ""}
        ${weeklyPending.length ? `
          <p style="margin:4px 0;color:#3D3752;font-size:12px">Still pending:</p>
          <ul style="margin:0;padding-left:20px">
            ${weeklyPending.map((t) => `<li>${t.text}</li>`).join("")}
          </ul>` : `<p style="color:#4E9C6E;margin:4px 0">✓ All weekly tasks completed!</p>`}
        ` : "";

      const html = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;color:#3D3752">
          <div style="background:linear-gradient(135deg,#B9A0EA,#8C93B8);padding:24px;border-radius:12px 12px 0 0">
            <h1 style="margin:0;color:#fff;font-size:20px">Good morning, ${user.username}!</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px">${dayName} · Your Job Search HQ digest</p>
          </div>
          <div style="background:#fff;padding:20px 24px;border:1px solid #E7E1F5;border-top:none;border-radius:0 0 12px 12px">
            ${dlSection}
            ${appSection}
            ${todoTodaySection}
            ${todoWeekSection}
            <p style="margin:20px 0 0;font-size:12px;color:#9791AC;border-top:1px solid #E7E1F5;padding-top:12px">
              This email is sent once a day from Job Search HQ. Open the app to update your tasks and applications.
            </p>
          </div>
        </div>`;

      const result = await sendEmail({
        to: user.email,
        subject: `Good morning ${user.username} — your ${dayName} job search digest`,
        html,
      });
      console.log("[digest]", result.ok ? `sent to ${user.email}` : `FAILED: ${result.error}`);
      if (result.ok) {
        sent += 1;
        await redis.set(guardKey, "1", { ex: 172800 });
      }
    }

    res.status(200).json({ ok: true, usersChecked: userIds.length, emailsSent: sent });
  } catch (e) {
    console.error("[digest cron error]", e.message);
    res.status(500).json({ error: e.message || "Cron failed" });
  }
};
