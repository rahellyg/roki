const filterForm = document.getElementById("filterForm");
const resultBox = document.getElementById("result");
const scheduleWrap = document.getElementById("scheduleWrap");
const scheduleButton = document.getElementById("scheduleButton");

function setResult(message, isApproved) {
  resultBox.textContent = message;
  resultBox.classList.remove("ok", "no");
  resultBox.classList.add(isApproved ? "ok" : "no");
  scheduleWrap.classList.toggle("hidden", !isApproved);
}

async function sendEmailInBackground(details) {
  const response = await fetch("/api/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ details }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
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
    sendEmailInBackground(formDetails).catch(() => {
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
  sendEmailInBackground(formDetails).catch(() => {
    setResult(
      "נראה שכרגע אין התאמה, וגם שליחת המייל כרגע נכשלה. אפשר לנסות שוב בעוד רגע.",
      false
    );
  });
});

scheduleButton.addEventListener("click", () => {
  alert("איזה כיף! השלב הבא הוא לקבוע שיחת היכרות אישית 📅");
});