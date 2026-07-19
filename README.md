# Job Search HQ — deployed, multi-user, end-to-end encrypted

A small serverless app (static frontend + a handful of API routes) that lives
on Vercel, with real cloud storage (Upstash Redis for data, Vercel Blob for
uploaded files — both free tier) so anyone, anywhere, can sign up and get
their own private application tracker, resume scanner, match analyzer,
interview prep, learning tracker, and profile — no LAN, no local install, and
no local computer required at any point.

Everything below can be done from a web browser.

## What "private even from the developer" means here

Every piece of your content — job pipeline, resume text, interview notes,
study topics, certifications, profile info, and uploaded files — is encrypted
**in your browser** with a key derived from a passphrase only you know
(PBKDF2 → AES-256-GCM) before it's ever sent to the server. The server (and
its database, and whoever deployed it, including you) only ever stores and
returns opaque ciphertext. There's no "admin view" of anyone's data, because
there's nothing readable to view.

The trade-off: there's no password-reset that recovers old data. If someone
forgets their passphrase, they can create a new login, but their old
encrypted entries can't be decrypted without the original passphrase — worth
telling people this when you share the app.

(One honest caveat: this protects data at rest — the database, backups,
admin dashboards. It doesn't protect against a malicious operator who
modifies the server code itself to capture the passphrase in transit, since
login necessarily sends it once, over HTTPS. For a personal tool run by
someone people already trust, this is a meaningful, practical privacy
upgrade, not a formal security audit.)

---

## Step 1 — Get this code onto GitHub

1. Go to [github.com](https://github.com) and log in (or create a free account).
2. Click **New repository**. Name it something like `job-search-hq`, keep it
   **Private** if you'd like, and click **Create repository**.
3. On the new repo's page, click **uploading an existing file**.
4. Drag in *every file and folder* from this project, keeping the structure
   intact (`api/`, `lib/`, `index.html`, `app.js`, `package.json`,
   `vercel.json`, `.gitignore`, `.env.example`, this `README.md`).
5. Scroll down and click **Commit changes**.

No git commands needed.

## Step 2 — Import the repo into Vercel

1. Go to [vercel.com](https://vercel.com) and sign up/log in with **Continue with GitHub**.
2. Click **Add New… → Project**, select the `job-search-hq` repo, click **Import**.
3. Vercel detects it as a plain project (no framework) — that's correct.
4. Don't deploy yet — add the storage and environment variables below first
   (or add them after and just redeploy).

## Step 3 — Add a database (Upstash Redis, free)

1. In your Vercel project, go to the **Storage** tab.
2. Click **Connect Database → Upstash**, follow the prompts to create a free
   Redis database and connect it to this project.
3. This auto-adds `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to
   your project's environment variables — nothing to copy/paste.

**Is this the best free option for ~10 people?** Yes, comfortably. Upstash's
free tier gives you 256 MB of storage and 500,000 commands/month, no card, no
time limit. A text-based app like this (job entries, resume text, notes) for
10 people uses a tiny fraction of that. Since the data is opaque encrypted
blobs, storage per user stays small regardless of how much someone writes.

## Step 4 — Add file storage (Vercel Blob, free) — for the Documents feature

1. Still in the **Storage** tab, click **Connect Database → Blob** (a separate
   product from Redis — you'll have two storage connections when done).
2. Choose the default **Public** access type when prompted (files are stored
   as encrypted ciphertext, so "public" only means "reachable if you know the
   random URL," which alone reveals nothing without your passphrase).
3. This auto-adds `BLOB_READ_WRITE_TOKEN` to your environment variables.
4. Vercel Blob's free tier includes 5 GB of storage — plenty for a handful of
   people storing resume PDFs and certificates (uploads are capped at 4MB
   each in this app).

If you skip this step, the rest of the app works fine — only the "Upload PDF"
button in the Profile tab won't work until it's connected.

## Step 5 — Add the remaining environment variables

Go to **Project → Settings → Environment Variables** and add:

| Name | Required? | Value |
|---|---|---|
| `JWT_SECRET` | **Yes** | Any long random string (30+ characters) — signs login sessions. |
| `ANTHROPIC_API_KEY` | Optional | Enables "AI coaching," "AI tailoring tips," and "Get suggestions" (study topics & certifications). Get one at [console.anthropic.com](https://console.anthropic.com/) — it's a paid API, check current pricing there. |
| `GOOGLE_CLIENT_ID` | Optional | Enables a "Continue with Google" button on the login screen. See below for how to get one. |

### Setting up "Continue with Google" (optional)

1. Go to the [Google Cloud Console credentials page](https://console.cloud.google.com/apis/credentials).
2. Create a project if you don't have one, then click **Create Credentials → OAuth client ID**.
3. If prompted, configure the OAuth consent screen first (choose **External**,
   fill in an app name and your email — for personal use you can leave it in
   "Testing" mode and just add your users' emails as test users, or publish it).
4. Application type: **Web application**.
5. Under **Authorized JavaScript origins**, add your Vercel URL, e.g.
   `https://job-search-hq-yourname.vercel.app` (add it again after your first
   deploy if you don't know the URL yet, then redeploy).
6. Click **Create**. Copy the **Client ID** (you don't need the secret — this
   app only verifies identity tokens, it never needs your OAuth secret).
7. Add it as `GOOGLE_CLIENT_ID` in Vercel and redeploy.

Note: since Google doesn't give this app a password, first-time Google
sign-ins are asked to set a separate **data passphrase** right after — that
passphrase (not your Google password) is what encrypts their data, so the
"even the server can't read it" guarantee holds for Google accounts too.

## Step 6 — Deploy

Click **Deploy** (or redeploy from the **Deployments** tab so new env vars
take effect).

You'll get a URL like `https://job-search-hq-yourname.vercel.app`. Open it,
sign up, and you're in. Share the URL with anyone you want to have their own
account — they sign up from any device, anywhere.

---

## What's in the app

- **Pipeline** — kanban tracker for applications, with stats. Enter submits the "Add application" form from any field.
- **Resume Scanner** — instant local ATS-style scoring, plus optional AI coaching.
- **Match Analyzer** — instant local keyword match against a job description, plus optional AI tailoring tips.
- **Interview Prep**, with two sub-tabs:
  - **Prep Checklist** — per-application checklist and notes.
  - **Learning & Certs** — tell it your target role and get AI-suggested study
    topics and certifications (or add your own manually), check off topics as
    you study, track progress, and log completed certifications with date and
    an optional credential link.
- **Profile** — a LinkedIn-style summary: headline, bio, skills, a rollup of
  your pipeline stats and earned certifications, and a **Documents** section
  to upload/download/delete PDFs (resume copies, transcripts, certificates —
  encrypted client-side, 4MB max per file).

## How accounts and data work

- Each account gets completely private, encrypted data — either username +
  password, or "Continue with Google" + a separate data passphrase.
- Logins are stateless sessions (JWT) valid for 30 days, stored in the
  browser's local storage.
- Closing the tab is fine — reopening it just asks for your passphrase again
  to re-derive the decryption key (a normal "unlock" step, not a full
  re-login), since the key itself is never stored anywhere, only held in
  memory while the tab is open.

## Costs

- **Vercel Hobby plan:** free, for personal/non-commercial use.
- **Upstash Redis free tier:** free, see Step 3 above.
- **Vercel Blob free tier:** free, see Step 4 above (only used if you upload documents).
- **Google Sign-In:** free.
- **Anthropic API (optional):** pay-as-you-go, only if you enable AI features.
  Without a key, everything else in the app still works fully.

## Making changes later

Since the code lives on GitHub, edit any file in GitHub's web editor (open a
file → pencil icon → edit → commit). Every commit to the main branch
automatically triggers a new Vercel deployment.

## Project structure

```
job-search-hq/
├── index.html               — page shell (loads React/Babel/Tailwind/Google Identity Services from CDN)
├── app.js                    — the entire frontend app (includes client-side encryption)
├── api/
│   ├── auth/
│   │   └── [action].js       — signup / login / google / me (one function, path-based)
│   ├── ai/
│   │   └── [type].js         — resume-feedback / match-tips / learning-suggestions
│   ├── data/
│   │   └── [resource].js     — jobs / resume / interviews / learning / profile / documents metadata
│   ├── documents/
│   │   └── [action].js       — upload / delete
│   └── config.js              — tells the frontend whether Google Sign-In is enabled
├── lib/
│   ├── redis.js                 — Upstash connection + JSON helpers
│   ├── auth.js                   — session signing/verification
│   ├── googleAuth.js              — Google ID token verification
│   └── claude.js                   — server-side Claude API call
├── vercel.json
├── package.json
└── .env.example                     — reference only; real values go in Vercel's dashboard
```

Each function file above handles multiple routes via a dynamic path segment (e.g.
`api/auth/[action].js` serves `/api/auth/signup`, `/api/auth/login`, etc.) — this
keeps the deployment to 5 serverless functions total, comfortably under Vercel
Hobby's 12-function-per-deployment limit, with room to add more features later.

Each route still becomes a live URL exactly as you'd expect —
`api/data/[resource].js` becomes `https://your-app.vercel.app/api/data/jobs`,
`/api/data/resume`, etc. Vercel runs each one on demand; there's no server to
start or stop.
