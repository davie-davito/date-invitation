# Date Invitation 💌

A beautiful, playful single-page website you can share with someone special to ask them on a date. When they hover over **No**, it runs away. When they tap **Yes**, a short wizard lets them pick the date vibe, location, day, and time — then their choices are emailed to you automatically.

**Live demo URL (after deploy):** `https://YOUR_USERNAME.github.io/queen/`

---

## Features

- Romantic glassmorphism design with floating hearts
- Runaway **No** button with teasing messages
- Multi-step **Yes** flow: date type → location → date/time → optional note
- Confetti celebration on submit
- Mobile-friendly (great for WhatsApp / iMessage links)
- Responses sent to your inbox via [Formspree](https://formspree.io) (free)

---

## Quick start (5 minutes)

### 1. Set up Formspree (receive their answer)

1. Go to [formspree.io](https://formspree.io) and create a free account.
2. Click **New Form** and give it a name (e.g. "Date Invitation").
3. Copy your **Form ID** — it looks like `xyzabcde` (the part after `/f/` in the form URL).
4. Open `js/config.js` in this project and replace `YOUR_FORM_ID_HERE`:

```js
window.FORMSPREE_CONFIG = {
  formId: "xyzabcde",  // your real Form ID
};
```

5. Save the file.

> **Note:** If `js/config.js` does not exist yet, copy `js/config.example.js` to `js/config.js` first.

Formspree will email you every time someone submits their date choices. You can also view submissions in the Formspree dashboard.

On the **first** test submission, Formspree may ask you to confirm your email address — check your inbox.

---

### 2. Test locally

Open `index.html` in your browser (double-click the file), or use a simple local server:

```bash
# Python (if installed)
cd queen
python -m http.server 8080
# Then visit http://localhost:8080
```

Walk through the flow and submit a test response. You should receive an email within a minute.

---

### 3. Deploy to GitHub Pages

1. Create a new repository on GitHub named `queen` (or any name).
2. Push this folder to the repo:

```bash
cd queen
git init
git add .
git commit -m "Add date invitation website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/queen.git
git push -u origin main
```

3. **Important:** `js/config.js` is in `.gitignore` by default. For GitHub Pages to work, you must include it in the repo:

```bash
git add -f js/config.js
git commit -m "Add Formspree config for deployment"
git push
```

> Formspree form IDs are safe to be public — they only allow submitting to your form, not reading data.

4. On GitHub: **Settings → Pages → Source** → deploy from branch `main`, folder `/ (root)`.
5. Wait 1–2 minutes. Your site will be live at:

```
https://YOUR_USERNAME.github.io/queen/
```

Share that link. Done.

---

## What you'll receive by email

Each submission includes:

| Field | Example |
|-------|---------|
| Date vibe | Dinner |
| Location | Let's decide together |
| Date | Saturday, July 12, 2026 |
| Time | Evening (7:30 PM) |
| Name | (optional) |
| Note | (optional message) |

---

## Customize later

### Change the opening message

Edit `index.html` — look for the `<h1>` and `<p class="subtitle">` in the ask screen.

### Add a personal name

Replace the subtitle or add a line like:

```html
<p class="subtitle">Hey Sarah, I've been thinking about this for a while…</p>
```

### Change colors

Edit CSS variables at the top of `css/style.css`:

```css
:root {
  --blush: #fce4ec;
  --rose: #f48fb1;
  --rose-deep: #e91e63;
  --cream: #fff8f0;
  --text: #880e4f;
}
```

### Change date options

Edit the option cards in `index.html` inside the wizard steps.

---

## Project structure

```
queen/
├── index.html
├── css/style.css
├── js/
│   ├── app.js           # Runaway No, wizard, Formspree submit, confetti
│   ├── config.js        # Your Formspree ID (gitignored locally)
│   └── config.example.js
├── .gitignore
├── .nojekyll
└── README.md
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Form is not configured yet" | Add your Formspree ID in `js/config.js` |
| No email received | Check spam; confirm email on first Formspree submission |
| Form works locally but not on GitHub Pages | Run `git add -f js/config.js` and push again |
| 404 on GitHub Pages | Ensure repo Settings → Pages is enabled on `main` branch |
| Date picker won't select past dates | By design — only today and future dates are allowed |

---

## License

Free to use, share, and customize. Made with 💕
