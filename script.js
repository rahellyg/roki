const filterForm = document.getElementById("filterForm");
const resultBox = document.getElementById("result");
const scheduleWrap = document.getElementById("scheduleWrap");
const scheduleButton = document.getElementById("scheduleButton");

const emailjsPublicKey = (window.EMAILJS_PUBLIC_KEY || "").trim();
const emailjsServiceId = (window.EMAILJS_SERVICE_ID || "").trim();
const emailjsTemplateId = (window.EMAILJS_TEMPLATE_ID || "").trim();
const emailjsConfigured =
  typeof emailjs !== "undefined" &&
  emailjsPublicKey &&
  emailjsServiceId &&
  emailjsTemplateId;

if (emailjsConfigured) {
  emailjs.init(emailjsPublicKey);
}

const debugEnabled =
  window.location.hostname === "localhost" ||
  window.location.hostname.endsWith("github.io") ||
  window.location.search.includes("debug=1");

function debugLog(...args) {
  if (debugEnabled) {
    console.log("[ROKI DEBUG]", ...args);
  }
}

function setResult(message, isApproved) {
  resultBox.textContent = message;
  resultBox.classList.remove("ok", "no");
  resultBox.classList.add(isApproved ? "ok" : "no");
  scheduleWrap.classList.toggle("hidden", !isApproved);
}

function buildEmailJSTemplateParams(details) {
  const message = [
    details.fullName && `שם: ${details.fullName}`,
    details.email && `אימייל: ${details.email}`,
    details.phone && `טלפון: ${details.phone}`,
    details.productOffer && `מוצר/שירות: ${details.productOffer}`,
    details.tasks && `משימות עקבי: ${details.tasks}`,
    details.dna && `תחקור DNA: ${details.dna}`,
    details.commitment != null && `שעות בשבוע: ${details.commitment}`,
    details.extraInfo && `מידע נוסף: ${details.extraInfo}`,
    details.approved != null && `התאמה: ${details.approved ? "כן" : "לא"}`,
  ]
    .filter(Boolean)
    .join("\n");
  const toEmail = (window.EMAILJS_TO_EMAIL || "").trim();
  if (!toEmail) {
    throw new Error("EMAIL_TO_NOT_CONFIGURED");
  }
  return {
    from_name: details.fullName || "",
    from_email: details.email || "",
    phone: details.phone || "לא צוין",
    message,
    to_email: toEmail,
    subject: `ליד חדש מ-${details.fullName || "רוקי"} - שאלון רוקי`,
  };
}

async function sendEmailInBackground(details) {
  if (!emailjsConfigured) {
    debugLog("Email not configured. Set EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID in config.js.");
    throw new Error("EMAIL_NOT_CONFIGURED");
  }
  const templateParams = buildEmailJSTemplateParams(details);
  debugLog("Sending via EmailJS", { toEmail: templateParams.to_email });
  const response = await emailjs.send(
    emailjsServiceId,
    emailjsTemplateId,
    templateParams
  );
  debugLog("EmailJS response:", response);
  if (response?.status !== 200) {
    throw new Error("FAILED_TO_SEND_EMAIL");
  }
}

filterForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const productOffer = document.getElementById("productOffer").value.trim();
  const tasks = filterForm.elements["tasks"]?.value;
  const dna = filterForm.elements["dna"]?.value;
  const commitment = Number(document.getElementById("commitment").value);
  const extraInfo = document.getElementById("extraInfo").value.trim();
  const fullName = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const phoneDigits = phone.replace(/\D/g, "");
  const phoneIsValid = phoneDigits.length >= 9;

  if (!productOffer || !tasks || !dna || !commitment || !fullName || !phone || !email) {
    setResult("נא למלא את כל השדות לפני שליחה.", false);
    return;
  }

  if (!emailIsValid) {
    setResult("כתובת המייל לא תקינה.", false);
    return;
  }

  if (!phoneIsValid) {
    setResult("מספר הטלפון לא תקין.", false);
    return;
  }

  const approved = tasks === "yes" && dna === "yes" && commitment >= 3;
  const formDetails = {
    fullName,
    phone,
    email,
    productOffer,
    tasks,
    dna,
    commitment,
    extraInfo,
    approved,
  };

  if (approved) {
    setResult(
      "מעולה! נראה שיש התאמה לקהילה. אפשר להמשיך לשלב הבא ולקבוע פגישה.",
      true
    );
    sendEmailInBackground(formDetails).catch((error) => {
      if (error?.message === "EMAIL_NOT_CONFIGURED" || error?.message === "EMAIL_TO_NOT_CONFIGURED") {
        setResult(
          "שליחת מייל לא מוגדרת. נא להגדיר EmailJS ב-config.js (כולל EMAILJS_TO_EMAIL).",
          true
        );
        return;
      }
      setResult(
        "מעולה! נראה שיש התאמה לקהילה, אבל שליחת המייל כרגע נכשלה. אפשר לנסות שוב בעוד רגע.",
        true
      );
    });
    return;
  }

  setResult(
    "כרגע נראה שאין התאמה למסגרת העבודה שלנו. אם בעתיד תהיה פתיחות לשיתוף פעולה והכוונה, נשמח לבדוק שוב.",
    false
  );
  sendEmailInBackground(formDetails).catch((error) => {
    if (error?.message === "EMAIL_NOT_CONFIGURED" || error?.message === "EMAIL_TO_NOT_CONFIGURED") {
      setResult(
        "שליחת מייל לא מוגדרת. נא להגדיר EmailJS ב-config.js (כולל EMAILJS_TO_EMAIL).",
        false
      );
      return;
    }
    setResult(
      "נראה שכרגע אין התאמה, וגם שליחת המייל כרגע נכשלה. אפשר לנסות שוב בעוד רגע.",
      false
    );
  });
});

scheduleButton.addEventListener("click", () => {
  alert("איזה כיף! השלב הבא הוא לקבוע שיחת היכרות אישית 📅");
});