# Prof. Dr. Mallika Kumar Portfolio Website

This is a public portfolio website with an admin dashboard at `/admin`.

## What is included

- Static portfolio homepage: `index.html`
- Editable content file: `content/profile.json`
- Admin login and editor: `admin/index.html`
- Decap CMS configuration: `admin/config.yml`
- Upload folders for images and files: `uploads/images` and `uploads/files`

## Publish with GitHub storage

1. Create a GitHub repository and upload this folder.
2. Deploy it on Netlify.
3. In Netlify, enable Identity.
4. In Netlify, enable Git Gateway.
5. Invite the admin email under Identity.
6. Visit `/admin`, log in, and edit the profile.

Decap CMS will commit profile edits, image uploads, and file uploads to the GitHub repository.

## Local editing

Open `index.html` with a local static server. For local CMS testing, run Decap's local backend in the project root:

```bash
npx decap-server
```

Then visit `/admin`.

## Important setup notes

- Replace the placeholder visual by uploading a real profile photo in `/admin`.
- Upload the current resume through the admin dashboard, or place it at `uploads/files/Dr.Mallika-Kumar-Resume.docx`.
- If you prefer GitHub Pages instead of Netlify, Decap CMS needs a separate GitHub OAuth backend. Netlify is the fastest setup for secure admin login plus GitHub commits.
