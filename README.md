# roki

## הפעלה עם שליחת מייל (SMTP)

1. התקנת תלויות:

```bash
npm install
```

2. יצירת קובץ סביבה:

```bash
cp .env.example .env
```

3. עדכון ערכים ב-`.env`:

- `WHATSAPP_PHONE_NUMBER_ID` — ה-Phone Number ID מתוך Meta
- `WHATSAPP_ACCESS_TOKEN` — Permanent Access Token
- `WHATSAPP_RECIPIENT` — מספר היעד בפורמט בינלאומי (למשל `9725XXXXXXX`)
- `SMTP_HOST` — כתובת שרת SMTP (למשל `smtp.gmail.com`)
- `SMTP_PORT` — פורט SMTP (לרוב `587`)
- `SMTP_SECURE` — האם חיבור מאובטח (`true`/`false`)
- `SMTP_USER` — שם משתמש ל-SMTP
- `SMTP_PASS` — סיסמה/App Password ל-SMTP
- `MAIL_FROM` — כתובת השולח שתופיע במייל
- `MAIL_TO` — כתובת המייל שאליה יישלחו הלידים
- `PORT` — פורט לשרת (ברירת מחדל `3000`)

4. הרצת האתר:

```bash
npm start
```

האתר ייפתח בכתובת `http://localhost:3000`.

## חיבור האתר המפורסם (GitHub Pages) ל-API חיצוני

ב-GitHub Pages אין שרת Node.js, לכן שליחת מייל מהטופס תעבוד רק אם תחברי Backend חיצוני.

1. פרסמי את `server.js` על שירות Backend (למשל Render/Railway/Vercel).
2. קחי את כתובת השרת (לדוגמה: `https://your-api.onrender.com`).
3. עדכני את הקובץ `config.js`:

```js
window.ROKI_API_BASE_URL = "https://your-api.onrender.com";
```

4. בצעי `git push` כדי לפרסם את השינוי ל-GitHub Pages.

השרת כבר מוגדר עם CORS ולכן יכול לקבל בקשות מהאתר המפורסם.