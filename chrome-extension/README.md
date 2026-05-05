## LinkedIn Roaster Importer (Chrome Extension)

This extension extracts **visible** profile text from a LinkedIn profile page you are viewing (while logged in), then imports it into your app (localhost or Vercel) so you can analyze it.

### What it does (and doesn’t)

- **Does**: read text from the current tab DOM on `linkedin.com/in/...` (About / Experience / Skills where available).
- **Does not**: scrape LinkedIn servers, bypass login, or fetch private data. It only reads what your browser already rendered.

### Install (Chrome / Edge)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder:
   - `linkedin-roaster/chrome-extension`

### Use

1. Start your app locally (`npm run dev`) **or** open your live Vercel app (e.g. `https://your-project.vercel.app`)
2. Open a LinkedIn profile page:
   - `https://www.linkedin.com/in/...`
3. Click the extension icon → **Extract**
4. Set **App URL** in the extension popup:
   - Local: `http://localhost:3000`
   - Live: `https://your-project.vercel.app`
5. If preview looks correct → **Open app & import**
5. In the app, you’ll see an “Imported from LinkedIn” hint and the text will be prefilled.
6. Click **Analyze Me**

### Notes / Troubleshooting

- If you see “No text found on page”, scroll a bit and try again (LinkedIn lazy-loads sections).
- Make sure **App URL** is correct in the popup (including `https://` for live).

