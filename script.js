const filterForm = document.getElementById("filterForm");
const resultBox = document.getElementById("result");
const scheduleWrap = document.getElementById("scheduleWrap");
const scheduleButton = document.getElementById("scheduleButton");

const apiBaseUrl = (window.ROKI_API_BASE_URL || "").replace(/\/$/, "");
const isGithubPages = window.location.hostname.endsWith("github.io");

function getEmailApiUrl() {
  if (apiBaseUrl) {
    return `${apiBaseUrl}/api/send-email`;
  }

  if (isGithubPages) {
    return null;
  }

  return "/api/send-email";
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

async function sendEmailInBackground(details) {
  const emailApiUrl = getEmailApiUrl();
  debugLog("Resolved email API URL:", emailApiUrl);

  if (!emailApiUrl) {
    debugLog("Email API URL missing. Check config.js ROKI_API_BASE_URL.");
    throw new Error("API_NOT_CONFIGURED");
  }

  const response = await fetch(emailApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ details }),
  });

  debugLog("Email API response status:", response.status);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    debugLog("Email API error payload:", data);
    if (response.status === 404 || response.status === 405) {
      throw new Error("API_UNAVAILABLE");
    }
    throw new Error(data.error || "FAILED_TO_SEND_EMAIL");
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
      if (error?.message === "API_NOT_CONFIGURED" || error?.message === "API_UNAVAILABLE") {
        setResult(
          "האתר פורסם כסטטי ולכן שליחת מייל אינה זמינה כרגע. כדי לאפשר שליחה בפרסום צריך לחבר שרת API חיצוני.",
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
    if (error?.message === "API_NOT_CONFIGURED" || error?.message === "API_UNAVAILABLE") {
      setResult(
        "כרגע אין שליחת מייל מהאתר המפורסם כי חסר שרת API חיצוני.",
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