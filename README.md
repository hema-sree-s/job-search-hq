# Job Search HQ

Single-file static web app. No build step, no dependencies to install locally —
just index.html, which loads Firebase and PDF/DOCX parsing libraries from CDN.

## Deploy
1. Push this folder to a GitHub repo.
2. Connect the repo to Vercel (Add New Project -> select repo -> Deploy).
   No build command needed, no output directory to configure.

## Requires (one-time, in Firebase Console)
- Firestore Database enabled (Production mode)
- Authentication -> Email/Password provider enabled
- Firestore security rules (see DEPLOY_STEPS.md)
