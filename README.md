# Prof. Dr. Mallika Kumar Portfolio Website

This is a public portfolio website with an admin dashboard at `/admin`.

## What is included

- Static portfolio homepage: `index.html`
- Editable content file: `content/profile.json`
- Admin login and editor: `admin/index.html`
- Decap CMS configuration: `admin/config.yml`
- Upload folders for images and files: `uploads/images` and `uploads/files`

## Admin login on GitHub Pages

The admin page is available at `/admin` and commits edits directly to GitHub.

To log in:

1. Create a GitHub fine-grained personal access token.
2. Limit it to this repository: `akassssh05-dev/mallika-kumar-portfolio`.
3. Give it repository permission: `Contents: Read and write`.
4. Open `/admin` and paste the token.

Use this only from a trusted browser. The token is stored in that browser's local storage so the admin page can save edits and upload files to GitHub.

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
