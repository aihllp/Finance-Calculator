/* helper: format number as RM with 2 decimals */
function formatRM(n) {
  if (!isFinite(n)) return "∞";
  return "RM " + Number(n).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  // read inputs
  const salary = Number(document.getElementById("salary").value) || 0;
  const otherIncome = Number(document.getElementById("otherIncome").value) || 0;

  const financeRepayment = Number(document.getElementById("financeRepayment").value) || 0;
  const otherExpenses = Number(document.getElementById("otherExpenses").value) || 0;

  const savings = Number(document.getElementById("savings").value) || 0;
  const investments = Number(document.getElementById("investments").value) || 0;
  const retirement = Number(document.getElementById("retirement").value) || 0;

  const balanceLoan = Number(document.getElementById("balanceLoan").value) || 0;
  const otherLiabilities = Number(document.getElementById("otherLiabilities").value) || 0;

  // compute quadrant totals
  const income = salary + otherIncome;
  const expenses = financeRepayment + otherExpenses;
  const assets = savings + investments + retirement;
  const liabilities = balanceLoan + otherLiabilities;

  // update summary card
  document.getElementById("totalIncome").textContent = formatRM(income);
  document.getElementById("totalExpenses").textContent = formatRM(expenses);
  document.getElementById("totalAssets").textContent = formatRM(assets);
  document.getElementById("totalLiabilities").textContent = formatRM(liabilities);

  // main results
  const cashflow = income - expenses;
  const networth = assets - liabilities;
  const wealthratio = expenses === 0 ? Infinity : (networth / expenses);

  // pick health level, color class and percent
  let level = "", textClass = "text-gray-700", bgClass = "bg-gray-500", percent = 0;

  if (wealthratio < 1) {
    level = "BANKRAP!";
    textClass = "text-red-600"; bgClass = "bg-red-600"; percent = 10;
  } else if (wealthratio <= 5) {
    level = "KRITIKAL";
    textClass = "text-orange-500"; bgClass = "bg-orange-500"; percent = 25;
  } else if (wealthratio <= 10) {
    level = "Normal";
    textClass = "text-gray-700"; bgClass = "bg-gray-500"; percent = 40;
  } else if (wealthratio <= 20) {
    level = "Sihat";
    textClass = "text-green-600"; bgClass = "bg-green-600"; percent = 55;
  } else if (wealthratio <= 50) {
    level = "Cergas";
    textClass = "text-lime-600"; bgClass = "bg-lime-500"; percent = 70;
  } else if (wealthratio <= 96) {
    level = "Athlete";
    textClass = "text-blue-600"; bgClass = "bg-blue-600"; percent = 85;
  } else if (wealthratio <= 168) {
    level = "Olympic Athlete";
    textClass = "text-purple-600"; bgClass = "bg-purple-600"; percent = 95;
  } else {
    level = "A Free MAN!";
    textClass = "text-yellow-600"; bgClass = "bg-yellow-400"; percent = 100;
  }

  // update result cards (formatted)
  document.getElementById("cashflow").textContent = formatRM(cashflow);
  document.getElementById("networth").textContent = formatRM(networth);
  document.getElementById("wealthratio").textContent = wealthratio === Infinity ? "∞" : wealthratio.toFixed(2);

  // update health text and progress bar color/width
  const healthEl = document.getElementById("health");
  healthEl.textContent = level;
  // remove previous text color classes and apply current (simple approach)
  healthEl.className = "text-2xl font-bold " + textClass;

  const fill = document.getElementById("health-fill");
  fill.style.width = percent + "%";
  // replace fill classes by setting className
  fill.className = "h-2 rounded " + bgClass + " w-0 transition-all duration-500";
  // force width after class change (ensure transition)
  setTimeout(() => { fill.style.width = percent + "%"; }, 10);
}
