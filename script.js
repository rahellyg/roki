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

filterForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const productOffer = document.getElementById("productOffer").value.trim();
  const tasks = filterForm.elements["tasks"]?.value;
  const dna = filterForm.elements["dna"]?.value;
  const commitment = Number(document.getElementById("commitment").value);

  if (!productOffer || !tasks || !dna || !commitment) {
    setResult("נא למלא את כל השדות לפני שליחה.", false);
    return;
  }

  const approved = tasks === "yes" && dna === "yes" && commitment >= 3;

  if (approved) {
    setResult(
      "מעולה! נראה שיש התאמה לקהילה. אפשר להמשיך לשלב הבא ולקבוע פגישה.",
      true
    );
    return;
  }

  setResult(
    "כרגע נראה שאין התאמה למסגרת העבודה שלנו. אם בעתיד תהיה פתיחות לשיתוף פעולה והכוונה, נשמח לבדוק שוב.",
    false
  );
});

scheduleButton.addEventListener("click", () => {
  alert("איזה כיף! השלב הבא הוא לקבוע שיחת היכרות אישית 📅");
});