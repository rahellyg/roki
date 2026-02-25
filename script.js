const filterForm = document.getElementById("filterForm");
const resultBox = document.getElementById("result");
const scheduleWrap = document.getElementById("scheduleWrap");
const scheduleButton = document.getElementById("scheduleButton");
const whatsappNumber = "972546955777";

function setResult(message, isApproved) {
  resultBox.textContent = message;
  resultBox.classList.remove("ok", "no");
  resultBox.classList.add(isApproved ? "ok" : "no");
  scheduleWrap.classList.toggle("hidden", !isApproved);
}

function openWhatsappWithDetails(details) {
  const message = [
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

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
}

filterForm.addEventListener("submit", (event) => {
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
    openWhatsappWithDetails(formDetails);
    return;
  }

  setResult(
    "כרגע נראה שאין התאמה למסגרת העבודה שלנו. אם בעתיד תהיה פתיחות לשיתוף פעולה והכוונה, נשמח לבדוק שוב.",
    false
  );
  openWhatsappWithDetails(formDetails);
});

scheduleButton.addEventListener("click", () => {
  alert("איזה כיף! השלב הבא הוא לקבוע שיחת היכרות אישית 📅");
});