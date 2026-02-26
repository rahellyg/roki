# roki

## הפעלה עם WhatsApp Business Cloud API

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
- `PORT` — פורט לשרת (ברירת מחדל `3000`)

4. הרצת האתר:

```bash
npm start
```

האתר ייפתח בכתובת `http://localhost:3000`.