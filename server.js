import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { Resend } from "resend";

const app = express();

const allowedOrigins = [
  "https://rahellyg.github.io",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      const allowed = allowedOrigins.some((o) =>
        typeof o === "string" ? o === origin : o.test(origin)
      );
      return cb(null, allowed ? origin : false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

const port = Number(process.env.PORT) || 3002;

// Use env vars (set in Render or .env). For local dev, defaults below let it work without setting env.
if (!process.env.MAIL_FROM) process.env.MAIL_FROM = "rahelly23@gmail.com";
if (!process.env.MAIL_TO) process.env.MAIL_TO = "m.c.bus@outlook.com";
if (!process.env.SMTP_HOST) process.env.SMTP_HOST = "smtp.gmail.com";
if (!process.env.SMTP_PASS) process.env.SMTP_PASS = "";
if (!process.env.SMTP_PORT) process.env.SMTP_PORT = "587";
if (!process.env.SMTP_USER) process.env.SMTP_USER = "rahelly23@gmail.com";

const RESEND_ENV_KEYS = ["RESEND_API_KEY", "MAIL_FROM", "MAIL_TO"];
const SMTP_ENV_KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "MAIL_FROM", "MAIL_TO"];

function getMissingEnvKeys(keys) {
  return keys.filter((key) => {
    const v = process.env[key];
    return v === undefined || v === null || String(v).trim() === "";
  });
}

function useResend() {
  const key = process.env.RESEND_API_KEY;
  return key !== undefined && key !== null && String(key).trim() !== "";
}

function formatLeadMessage(details) {
  return [
    details.fullName && `Name: ${details.fullName}`,
    details.email && `Email: ${details.email}`,
    details.phone && `Phone: ${details.phone}`,
    details.productOffer && `Product: ${details.productOffer}`,
    details.extraInfo && `Info: ${details.extraInfo}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatLeadEmailHtml(details) {
  return `<p>${formatLeadMessage(details).replace(/\n/g, "<br>")}</p>`;
}

app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.post("/api/send-email", async (req, res) => {
    try {
      const details = req.body?.details;
  
      console.log("[email] send-email called", {
        hasDetails: Boolean(details),
        fullName: details?.fullName,
        email: details?.email,
      });
  
      if (!details || typeof details !== "object") {
        return res.status(400).json({ ok: false, error: "INVALID_PAYLOAD" });
      }

      const useResendApi = useResend();
      const requiredKeys = useResendApi ? RESEND_ENV_KEYS : SMTP_ENV_KEYS;
      const missing = getMissingEnvKeys(requiredKeys);
      if (missing.length) {
        console.error("[email] missing env vars", missing);
        return res.status(500).json({
          ok: false,
          error: "MISSING_EMAIL_ENV",
          missing,
        });
      }

      const subject = `ליד חדש מ-${details.fullName}`;
      const text = formatLeadMessage(details);
      const html = formatLeadEmailHtml(details);
      const from = process.env.MAIL_FROM;
      const to = process.env.MAIL_TO;

      if (useResendApi) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data, error } = await resend.emails.send({
          from,
          to: [to],
          subject,
          html,
          text,
        });
        if (error) {
          console.error("[email] Resend failed", error);
          return res.status(500).json({
            ok: false,
            error: "EMAIL_SEND_FAILED",
            code: error?.name || null,
          });
        }
        console.log("[email] Resend success", { to, from, id: data?.id });
        return res.json({ ok: true });
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
        family: 4,
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 15000),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });

      console.log("[email] sendMail success", { to, from });
      return res.json({ ok: true });
    } catch (error) {
      console.error("[email] sendMail failed", {
        message: error?.message,
        code: error?.code,
        response: error?.response,
        command: error?.command,
      });

      return res.status(500).json({
        ok: false,
        error: "EMAIL_SEND_FAILED",
        code: error?.code || null,
      });
    }
  });
  
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
