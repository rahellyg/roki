const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 3002;

// Use env vars (set in Render or .env). For local dev, defaults below let it work without setting env.
if (!process.env.MAIL_FROM) process.env.MAIL_FROM = "rahelly23@gmail.com";
if (!process.env.MAIL_TO) process.env.MAIL_TO = "m.c.bus@outlook.com";
if (!process.env.SMTP_HOST) process.env.SMTP_HOST = "smtp.gmail.com";
if (!process.env.SMTP_PASS) process.env.SMTP_PASS = "unbp raqe riry tnlb";
if (!process.env.SMTP_PORT) process.env.SMTP_PORT = "587";
if (!process.env.SMTP_USER) process.env.SMTP_USER = "rahelly23@gmail.com";

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
  
      // const missingEmailEnv = getMissingEmailEnvKeys();
  
    //   if (missingEmailEnv.length) {
    //     console.error("[email] missing env vars", missingEmailEnv);
    //     return res.status(500).json({
    //       ok: false,
    //       error: "MISSING_EMAIL_ENV",
    //       missing: missingEmailEnv,
    //     });
    //   }
  
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
        family: 4, // Force IPv4 (Render often cannot reach Gmail over IPv6)
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 15000),
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
  
      console.log("[email] sendMail success", {
        to: process.env.MAIL_TO,
        from: process.env.MAIL_FROM,
      });
  
      return res.json({ ok: true });
    } catch (error) {
      console.error("[email] sendMail failed", {
        message: error?.message,
        code: error?.code,
        response: error?.response,
        command: error?.command,
      });
  
      return res.status(500).json({ ok: false, error: "EMAIL_SEND_FAILED" });
    }
  });
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

  module.exports = app;