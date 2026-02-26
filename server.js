import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import cors from "cors";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 3000);

const requiredEnv = [
  "WHATSAPP_PHONE_NUMBER_ID",
  "WHATSAPP_ACCESS_TOKEN",
  "WHATSAPP_RECIPIENT",
];

const requiredEmailEnv = [
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "MAIL_FROM",
  "MAIL_TO",
];

function getMissingEnvKeys() {
  return requiredEnv.filter((key) => !process.env[key]);
}

function getMissingEmailEnvKeys() {
  return requiredEmailEnv.filter((key) => !process.env[key]);
}

function formatLeadMessage(details) {
  return [
    "ליד חדש מטופס ההתאמה - Roki",
    "",
    `שם: ${details.fullName}`,
    `טלפון: ${details.phone}`,
    `מייל: ${details.email}`,
    "",
    `מוצר/שירות: ${details.productOffer}`,
    `ביצוע משימות: ${details.tasks === "yes" ? "כן" : "לא"}`,
    `פתיחות לתחקור DNA: ${details.dna === "yes" ? "כן" : "לא"}`,
    `שעות בשבוע: ${details.commitment}`,
    `מידע נוסף: ${details.extraInfo || "לא צוין"}`,
    "",
    `סטטוס התאמה: ${details.approved ? "מתאים/ה" : "לא מתאים/ה כרגע"}`,
  ].join("\n");
}

function formatLeadEmailHtml(details) {
  return `
    <h2>ליד חדש מטופס ההתאמה - Roki</h2>
    <p><strong>שם:</strong> ${details.fullName}</p>
    <p><strong>טלפון:</strong> ${details.phone}</p>
    <p><strong>מייל:</strong> ${details.email}</p>
    <hr />
    <p><strong>מוצר/שירות:</strong> ${details.productOffer}</p>
    <p><strong>ביצוע משימות:</strong> ${details.tasks === "yes" ? "כן" : "לא"}</p>
    <p><strong>פתיחות לתחקור DNA:</strong> ${details.dna === "yes" ? "כן" : "לא"}</p>
    <p><strong>שעות בשבוע:</strong> ${details.commitment}</p>
    <p><strong>מידע נוסף:</strong> ${details.extraInfo || "לא צוין"}</p>
    <hr />
    <p><strong>סטטוס התאמה:</strong> ${details.approved ? "מתאים/ה" : "לא מתאים/ה כרגע"}</p>
  `;
}

app.use(express.json({ limit: "200kb" }));
app.use(cors());
app.use(express.static(__dirname));

app.post("/api/send-email", async (req, res) => {
  try {
    const details = req.body?.details;

    if (!details || typeof details !== "object") {
      return res.status(400).json({ ok: false, error: "INVALID_PAYLOAD" });
    }

    const missingEmailEnv = getMissingEmailEnvKeys();

    if (missingEmailEnv.length) {
      return res.status(500).json({
        ok: false,
        error: "MISSING_EMAIL_ENV",
        missing: missingEmailEnv,
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO,
      subject: `ליד חדש מ-${details.fullName}`,
      text: formatLeadMessage(details),
      html: formatLeadEmailHtml(details),
    });

    return res.json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "EMAIL_SEND_FAILED" });
  }
});

app.post("/api/send-whatsapp", async (req, res) => {
  try {
    const details = req.body?.details;

    if (!details || typeof details !== "object") {
      return res.status(400).json({ ok: false, error: "INVALID_PAYLOAD" });
    }

    const missingEnv = getMissingEnvKeys();

    if (missingEnv.length) {
      return res.status(500).json({
        ok: false,
        error: "MISSING_ENV",
        missing: missingEnv,
      });
    }

    const whatsappApiUrl = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
    const body = {
      messaging_product: "whatsapp",
      to: process.env.WHATSAPP_RECIPIENT,
      type: "text",
      text: {
        body: formatLeadMessage(details),
      },
    };

    const response = await fetch(whatsappApiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "WHATSAPP_API_ERROR",
        details: data,
      });
    }

    return res.json({ ok: true, response: data });
  } catch {
    return res.status(500).json({ ok: false, error: "INTERNAL_SERVER_ERROR" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
