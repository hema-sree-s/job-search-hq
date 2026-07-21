# Job Search HQ

A personal, multi-user job search app deployed on Vercel: application pipeline
(kanban), resume scanner, job-match analyzer, interview prep, learning &
certification tracker, and a LinkedIn-style profile with PDF document storage.
Free to run, works from any device, no local computer needed to operate it.

**Live architecture:** static frontend (React via CDN, no build step) +
Vercel serverless functions + Upstash Redis (data) + Vercel Blob (files) +
optional free Gemini AI features.

---

## Deploy from scratch (all in the browser)

1. **GitHub**: create a repo, upload all files/folders from this project
   (keep the structure: `api/`, `lib/`, `index.html`, `app.js`, etc.).
2. **Vercel**: [vercel.com](https://vercel.com) → sign in with GitHub →
   Add New → Project → import the repo. No framework settings needed.
3. **Database**: Project → Storage tab → connect **Upstash** (Redis). If it
   doesn't appear in search, install from
   [vercel.com/marketplace/upstash](https://vercel.com/marketplace/upstash).
4. **File storage**: Storage tab → Create Database → **Blob** → Public access.
   (Skip if you don't need PDF uploads; everything else works without it.)
5. **Environment variables** (Settings → Environment Variables):

   | Name | Required | What it is |
   |---|---|---|
   | `JWT_SECRET` | **Yes** | Any 30+ char random string; signs login sessions |
   | `GEMINI_API_KEY` | Optional | **Free** AI features — key from [aistudio.google.com](https://aistudio.google.com), no card needed |
   | `ANTHROPIC_API_KEY` | Optional | Paid alternative AI (used instead of Gemini if both set) |
   | `GOOGLE_CLIENT_ID` | Optional | Enables "Continue with Google" — from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
   | `GEMINI_MODEL` | Optional | Pin a specific Gemini model; default is the auto-updating `gemini-flash-latest` |
   | `BREVO_API_KEY` | Optional | **Free** email (password reset + deadline reminders) — key from [brevo.com](https://www.brevo.com) (300 emails/day free) |
   | `EMAIL_FROM` | Optional | The sender address you verified in Brevo (required with `BREVO_API_KEY`) |
   | `CRON_SECRET` | Optional | Locks the daily reminder cron endpoint to Vercel's scheduler |

   (`UPSTASH_REDIS_REST_URL`/`TOKEN` or `KV_REST_API_URL`/`TOKEN`, and
   `BLOB_READ_WRITE_TOKEN` are added automatically by the storage integrations.)
6. **Deploy**, and redeploy any time you change environment variables.

### Google Sign-In setup (optional)
Create an OAuth **Web application** client ID in Google Cloud Console, add
your Vercel URL (e.g. `https://your-app.vercel.app`) under **Authorized
JavaScript origins**, and put the client ID in `GOOGLE_CLIENT_ID`. While the
OAuth consent screen is in "Testing" mode only you and added test users can
sign in — click "Publish App" to open it to everyone.

---

## How it works

- **Accounts**: username+password (bcrypt-hashed) or Google Sign-In. Sessions
  are JWTs held in `sessionStorage`, so **every new browser session starts at
  the login screen** — refreshing a tab keeps you in, closing the browser
  logs you out.
- **Data**: each user's pipeline, resume, interview notes, learning progress,
  profile, and document list are stored per-account in Redis. Data is private
  between users; the deployment owner (whoever runs the Vercel project) has
  admin-level access to the database.
- **Files**: PDFs (max 4MB) upload to Vercel Blob at unguessable random URLs.
- **AI features** (resume coaching, match tips, learning suggestions, profile
  autofill): free via Gemini's no-card free tier. The app uses Google's
  auto-updating `gemini-flash-latest` alias with automatic fallbacks so model
  retirements don't break it. Free-tier prompts may be used by Google to
  improve their products. Everything except the AI buttons works with no key.
- **Resume parsing** happens fully in the browser (pdf.js) — PDF text
  extraction reconstructs real line breaks so scoring and profile autofill
  see the resume's actual structure.
- **Scoring honesty**: the resume score is a local heuristic. Every ATS tool
  scores differently — treat scores as directional, not absolute.

## Serverless function layout (5 functions, under Vercel Hobby's 12 limit)

```
api/
├── auth/[action].js        → /api/auth/signup · login · google · me
├── ai/[type].js            → /api/ai/resume-feedback · match-tips ·
│                              learning-suggestions · profile-suggestions
├── data/[resource].js      → /api/data/jobs · resume · interviews ·
│                              learning · profile · documents  (GET/PUT/DELETE)
├── documents/[action].js   → /api/documents/upload · delete
└── config.js               → /api/config (public: is Google Sign-In enabled?)
lib/
├── redis.js                → Upstash connection (accepts both env var naming schemes)
├── auth.js                 → JWT sign/verify (+ detailed failure reasons)
├── googleAuth.js           → Google ID token verification
└── claude.js               → AI provider caller (Anthropic → Gemini fallback)
```

## Costs

Vercel Hobby: free. Upstash free tier: 256MB / 500K commands per month.
Vercel Blob free tier: 5GB. Gemini free tier: no card, rate-limited but ample
for personal use. Anthropic API: optional, pay-as-you-go.

## Making changes

Edit files on GitHub (web editor or VS Code) → commit to main → Vercel
auto-deploys. See `NOTES.md` for the full developer guide.