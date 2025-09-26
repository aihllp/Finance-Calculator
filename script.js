/* helper: format number as RM with 2 decimals */
function formatRM(n) {
  if (!isFinite(n)) return "∞";
  return "RM " + Number(n).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calculate() {
  // Income
  const salary = Number(document.getElementById("salary").value) || 0;
  const otherIncome = Number(document.getElementById("otherIncome").value) || 0;

  // Expenses
  const creditCardRepayment = Number(document.getElementById("creditCardRepayment").value) || 0;
  const vehicleLoanRepayment = Number(document.getElementById("vehicleLoanRepayment").value) || 0;
  const propertyLoanRepayment = Number(document.getElementById("propertyLoanRepayment").value) || 0;
  const personalHouseholdExpenses = Number(document.getElementById("personalHouseholdExpenses").value) || 0;
  const insuranceExpenses = Number(document.getElementById("insuranceExpenses").value) || 0;
  const otherExpenses = Number(document.getElementById("otherExpenses").value) || 0;

  // Assets
  const savings = Number(document.getElementById("savings").value) || 0;
  const propertyValue = Number(document.getElementById("propertyValue").value) || 0;
  const investmentsValue = Number(document.getElementById("investmentsValue").value) || 0;
  const retirementFund = Number(document.getElementById("retirementFund").value) || 0;

  // Liabilities
  const creditCardBalance = Number(document.getElementById("creditCardBalance").value) || 0;
  const vehicleLoanBalance = Number(document.getElementById("vehicleLoanBalance").value) || 0;
  const propertyFinancingBalance = Number(document.getElementById("propertyFinancingBalance").value) || 0;
  const otherLiabilities = Number(document.getElementById("otherLiabilities").value) || 0;

  // Totals
  const income = salary + otherIncome;
  const expenses = creditCardRepayment + vehicleLoanRepayment + propertyLoanRepayment + personalHouseholdExpenses + insuranceExpenses + otherExpenses;
  const assets = savings + propertyValue + investmentsValue + retirementFund;
  const liabilities = creditCardBalance + vehicleLoanBalance + propertyFinancingBalance + otherLiabilities;

  // Update summary
  document.getElementById("totalIncome").textContent = formatRM(income);
  document.getElementById("totalExpenses").textContent = formatRM(expenses);
  document.getElementById("totalAssets").textContent = formatRM(assets);
  document.getElementById("totalLiabilities").textContent = formatRM(liabilities);

  // Results
  const cashflow = income - expenses;
  const networth = assets - liabilities;
  const wealthratio = expenses === 0 ? Infinity : (networth / expenses);

  // Financial health evaluation
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

  // Update UI
  document.getElementById("cashflow").textContent = formatRM(cashflow);
  document.getElementById("networth").textContent = formatRM(networth);
  document.getElementById("wealthratio").textContent = wealthratio === Infinity ? "∞" : wealthratio.toFixed(2);

  const healthEl = document.getElementById("health");
  healthEl.textContent = level;
  healthEl.className = "text-2xl font-bold " + textClass;

  const fill = document.getElementById("health-fill");
  fill.style.width = percent + "%";
  fill.className = "h-2 rounded " + bgClass + " w-0 transition-all duration-500";
  setTimeout(() => { fill.style.width = percent + "%"; }, 10);
}