import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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

function getMissingEnvKeys() {
  return requiredEnv.filter((key) => !process.env[key]);
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

app.use(express.json({ limit: "200kb" }));
app.use(express.static(__dirname));

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
