// Format helper
function formatRM(n) {
  if (!isFinite(Number(n))) return "∞";
  return "RM " + Number(n).toLocaleString("en-MY", { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
}

function formatNumberWithComma(value) {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function unformatNumber(value) {
  return value.replace(/,/g, "");
}

/**
 * @param {string} id - The element ID.
 * @param {boolean} isPercentage - Whether the input should be divided by 100.
 * @returns {number} The cleaned numeric value.
 */

function getNumericValue(id, isPercentage = false) {
    const element = document.getElementById(id);
    if (!element) return 0;
    let value = element.value || element.placeholder || '0';
    
    if (typeof element.getRawValue === 'function') {
        value = element.getRawValue();
    } else {  
        value = unformatNumber(value);
    }

    let num = parseFloat(value) || 0;
    if (isPercentage) {
        num = num / 100;
    }
    return num;
}

document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(".num-input");

  inputs.forEach(input => {

    input.addEventListener("input", (e) => {
      let raw = unformatNumber(e.target.value);

      raw = raw.replace(/\D/g, "");

      e.target.value = formatNumberWithComma(raw);
    });

    input.getRawValue = function() {
      return Number(unformatNumber(this.value)) || 0;
    };
  });
});
// Chart instances
let savingsChartInstance = null;
let liquidityChartInstance = null;
let debtChartInstance = null;
let wealthRatio = 0;
//store salary/expenses in memory instead of localStorage
let totalSalary = 0;
let totalExpenses = 0;
// Main calculate function
function calculate() {
  const salary = document.getElementById("salary").getRawValue() || 0;
  const otherIncome = document.getElementById("otherIncome").getRawValue() || 0;
  const creditCardRepayment = document.getElementById("creditCardRepayment").getRawValue() || 0;
  const vehicleLoanRepayment = document.getElementById("vehicleLoanRepayment").getRawValue() || 0;
  const propertyLoanRepayment = document.getElementById("propertyLoanRepayment").getRawValue() || 0;
  const personalHouseholdExpenses = document.getElementById("personalHouseholdExpenses").getRawValue() || 0;
  const insuranceExpenses = document.getElementById("insuranceExpenses").getRawValue() || 0;
  const otherExpenses = document.getElementById("otherExpenses").getRawValue() || 0;
  const savings = document.getElementById("savings").getRawValue() || 0;
  const propertyValue = document.getElementById("propertyValue").getRawValue() || 0;
  const investmentsValue = document.getElementById("investmentsValue").getRawValue() || 0;
  const retirementFund = document.getElementById("retirementFund").getRawValue() || 0;
  const creditCardBalance = document.getElementById("creditCardBalance").getRawValue() || 0;
  const vehicleLoanBalance = document.getElementById("vehicleLoanBalance").getRawValue() || 0;
  const propertyFinancingBalance = document.getElementById("propertyFinancingBalance").getRawValue() || 0;
  const otherLiabilities = document.getElementById("otherLiabilities").getRawValue() || 0;

  const income = salary + otherIncome;
  const expenses = creditCardRepayment + vehicleLoanRepayment + propertyLoanRepayment + personalHouseholdExpenses + insuranceExpenses + otherExpenses;
  const assets = savings + propertyValue + investmentsValue + retirementFund;
  const liabilities = creditCardBalance + vehicleLoanBalance + propertyFinancingBalance + otherLiabilities;
  document.getElementById("totalIncome").textContent = formatRM(income);
  document.getElementById("totalExpenses").textContent = formatRM(expenses);
  document.getElementById("totalAssets").textContent = formatRM(assets);
  document.getElementById("totalLiabilities").textContent = formatRM(liabilities);

  const cashFlowVal = income - expenses;
  const networth = assets - liabilities;
  const currentWealthRatio = expenses === 0 ? Infinity : (networth / expenses);
  const savingsratio = income === 0 ? 0 : ((income - expenses) / income) * 100;
  const liquidityratio = expenses === 0 ? Infinity : (savings / expenses);
  const debtServiceRatio = income === 0 ?
  0 : ((creditCardRepayment + vehicleLoanRepayment + propertyLoanRepayment) / income) * 100;

  showResultsSection();

  document.getElementById("cashflow").textContent = formatRM(cashFlowVal);
  document.getElementById("networth").textContent = formatRM(networth);
  document.getElementById("wealthratio").textContent = currentWealthRatio === Infinity ? "∞" : currentWealthRatio.toFixed(2);
  document.getElementById("savingsratio").textContent = savingsratio.toFixed(2) + "%";
  document.getElementById("liquidityratio").textContent = liquidityratio === Infinity ? "∞" : liquidityratio.toFixed(2);
  document.getElementById("debtServiceRatio").textContent = debtServiceRatio.toFixed(2) + "%";

  // Determine health label based on Wealth Ratio
  wealthRatio = currentWealthRatio === Infinity ?
  200 : Math.max(0, Math.min(currentWealthRatio, 200));

  let healthText = "";
  let barColor = "#facc15";
  if (wealthRatio < 1) {
    healthText = "Bankrupt!";
    barColor = "#dc2626";
  } else if (wealthRatio < 5) {
    healthText = "Critical";
    barColor = "#f87171";
  } else if (wealthRatio < 10) {
    healthText = "Normal";
    barColor = "#fbbf24";
  } else if (wealthRatio < 20) {
    healthText = "Healthy";
    barColor = "#34d399";
  } else if (wealthRatio < 50) {
    healthText = "Fit";
    barColor = "#10b981";
  } else if (wealthRatio < 96) {
    healthText = "Athlete";
    barColor = "#3b82f6";
  } else if (wealthRatio < 168) {
    healthText = "Olympic Athlete";
    barColor = "#6366f1";
  } else {
    healthText = "A Free MAN!";
    barColor = "#a855f7";
  }

  document.getElementById("health").textContent = healthText;
  const bar = document.getElementById("health-fill");
  bar.style.transition = "all 0.8s ease-in-out";
  bar.style.width = Math.min((wealthRatio / 200) * 100, 100) + "%";
  bar.style.backgroundColor = barColor;

  updateRatiosChart(savingsratio, liquidityratio, debtServiceRatio);

  //store values in localstorage
  localStorage.setItem("totalSalary", income);
  localStorage.setItem("totalExpenses", expenses);
  localStorage.setItem("totalLiabilities", liabilities);
  localStorage.setItem("totalAssets", assets);
  // FIX: Store the retirement fund value so the retirement tab can retrieve it.
  localStorage.setItem("retirementFundValue", retirementFund); 
  //update takaful
  document.getElementById('salaryText').textContent = formatRM(income);
  document.getElementById('expensesText').textContent = formatRM(expenses);
  document.getElementById('netText').textContent = formatRM(cashFlowVal);
}

// retrieve localstorage data on load
window.addEventListener("DOMContentLoaded", () => {
  const savedIncome = Number(localStorage.getItem("totalSalary") || 0);
  const savedExpenses = Number(localStorage.getItem("totalExpenses") || 0);
  const savedAssets = Number(localStorage.getItem("totalAssets") || 0);
  const savedLiabilities = Number(localStorage.getItem("totalLiabilities") || 0);

  if (savedIncome > 0 && savedExpenses > 0) {
    totalSalary = savedIncome;
    totalExpenses = savedExpenses;

    document.getElementById('salaryText').textContent = formatRM(savedIncome);
    document.getElementById('expensesText').textContent = formatRM(savedExpenses);
    document.getElementById('netText').textContent = formatRM(savedIncome - savedExpenses);
  }

  if (savedAssets > 0) {
    document.getElementById("totalAssets").textContent = formatRM(savedAssets);
  }

  if (savedLiabilities > 0) 
  {
    document.getElementById("totalLiabilities").textContent = formatRM(savedLiabilities);
  }
});

function updateRatiosChart(savingsRatio, liquidityRatio, debtServiceRatio) {
  const savingsBenchmark = 10;
  const liquidityBenchmark = 3;
  const debtBenchmark = 35;

  //update colors based on benchmarks
  const savingsElem = document.getElementById("savingsratio");
  const liquidityElem = document.getElementById("liquidityratio");
  const debtElem = document.getElementById("debtServiceRatio");

  if (savingsElem) savingsElem.style.color = savingsRatio >= savingsBenchmark ? "#16a34a" : "#dc2626";
  const liquidityValue = liquidityRatio === Infinity ? 200 : liquidityRatio;
  if (liquidityElem) liquidityElem.style.color = liquidityValue >= liquidityBenchmark ? "#16a34a" : "#dc2626";
  if (debtElem) debtElem.style.color = debtServiceRatio <= debtBenchmark ? "#16a34a" : "#dc2626";

  //destroy previous chart if exists
  if (savingsChartInstance) savingsChartInstance.destroy();
  if (liquidityChartInstance) liquidityChartInstance.destroy();
  if (debtChartInstance) debtChartInstance.destroy();

  savingsChartInstance = createMiniChart("savingsChart","Savings", Number(Number(savingsRatio).toFixed(2)), savingsBenchmark);
  liquidityChartInstance = createMiniChart("liquidityChart","Liquidity", Number(Number(liquidityValue).toFixed(2)), liquidityBenchmark);
  debtChartInstance = createMiniChart("debtChart","Debt Service", Number(Number(debtServiceRatio).toFixed(2)), debtBenchmark);
}

//charts for ratios
function createMiniChart(ctxId, label, userValue, benchmarkValue) {
  const el = document.getElementById(ctxId);
  if (!el) return null;
  const ctx = el.getContext("2d");

  let resultColor = "";

  // Identify which ratio this chart is for
  const isDebtService = label.toLowerCase().includes("debt");
  if (isDebtService) {
    if (userValue < benchmarkValue) resultColor = "#16a34a";
    else if (userValue === benchmarkValue) resultColor = "#facc15";
    else resultColor = "#dc2626";
  } 
  else {
    if (userValue > benchmarkValue) resultColor = "#16a34a";
    else if (userValue === benchmarkValue) resultColor = "#facc15";
    else resultColor = "#dc2626";
  }

  return new Chart(ctx, {
    type: "bar",
    data: {
      labels: [label],
      datasets: [
        {
          label: "Benchmark",
          data: [benchmarkValue],
          backgroundColor: "#3B82F6",
          borderRadius: 6,
        },
        {
          label: "Your Result",
          data: [userValue],
          backgroundColor: resultColor,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: 
        {
          display: true,
          position: "bottom",
          labels: { color: "#4b5563", font: { size: 11 } },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#4b5563" },
 
          categoryPercentage: 0.5,
          barPercentage: 0.6,
        },
        y: {
          beginAtZero: true,
          grid: { color: "#f3f4f6" },
          ticks: { color: "#6b7280" },
        },
      },
      animation: { 
        duration: 900, 
        easing: "easeOutQuart"
      },
    },
  });
}

function showResultsSection() {
  const resultsSection = document.getElementById("resultsSection");
  if (resultsSection) {
    resultsSection.classList.add("animate-fadeIn");
    setTimeout(() => {
      try { resultsSection.scrollIntoView({ behavior: "smooth", block: "start" }); } catch (e) {}
    }, 400);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      tabButtons.forEach(b => {
        b.classList.remove("active-tab", "text-gray-700", "border-blue-500");
        b.classList.add("text-gray-500");
      });
      tabContents.forEach(tc => tc.classList.add("hidden"));

      btn.classList.add("active-tab", "text-gray-700", "border-blue-500");
      btn.classList.remove("text-gray-500");
    
      document.getElementById(btn.dataset.tab).classList.remove("hidden");
    });
  });
});

function toggleInfo(id) {
  const info = document.getElementById(id + "-info");
  if (!info) return;
  const card = info.parentElement;
  info.classList.toggle("show");
  card.classList.toggle("active");
}

AOS.init({ duration: 1000, once: true });
//show takaful section and scroll to it + takaful plan logic
document.addEventListener('DOMContentLoaded', function () {
  const showTakafulBtn = document.getElementById('showTakafulBtn');
  const takafulSection = document.getElementById('takafulSection');

  if (showTakafulBtn && takafulSection) {
    showTakafulBtn.addEventListener('click', function () {
      takafulSection.classList.add('show');
      setTimeout(() => {
        takafulSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 420);

      document.getElementById('salaryText').textContent = totalSalary > 0 ? formatRM(totalSalary) : 'No data found';
      document.getElementById('expensesText').textContent = totalExpenses > 0 ? formatRM(totalExpenses) : 'No data found';
      document.getElementById('netText').textContent = (totalSalary > 0 && totalExpenses > 0) ? formatRM(totalSalary - totalExpenses) : 'No data found';
    });
  }

  //takaful plan logic (cards)
  document.querySelectorAll('.coverage-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.coverage-card').forEach(c => c.classList.remove('ring'));
      card.classList.add('ring');
      showCoverage(card.id);
    });
  });
});

//takaful coverage calculation + chart update
function showCoverage(plan) {
  const salary = Number(localStorage.getItem("totalSalary")) || 0;
  const expenses = Number(localStorage.getItem("totalExpenses")) || 0;

  if (salary <= 0 || expenses <= 0) {
    alert('Please calculate your financial data first.');
    return;
  }

  // Define multipliers for 1-year, 5-year, and 10-year coverage
  const multiplierOneYear = 12;
  const multiplierFiveYear = 60;
  const multiplierTenYear = 120; // This is the value needed for TNA later

  // Calculate coverage for the currently selected plan
  let currentMultiplier;
  switch (plan) {
    case "oneYear": currentMultiplier = multiplierOneYear; break;
    case "fiveYear": currentMultiplier = multiplierFiveYear; break;
    case "tenYear": currentMultiplier = multiplierTenYear; break;
    default: currentMultiplier = multiplierOneYear;
  }

  const coverageIncome = salary * currentMultiplier;
  const coverageExpenses = expenses * currentMultiplier;

  // --- NEW: Calculate and Store 10-Year Coverage Separately ---
  const coverageIncome10Y = salary * multiplierTenYear;
  const coverageExpenses10Y = expenses * multiplierTenYear;
  
  // Store the 10-year values in new keys for reliable retrieval by TNA
  localStorage.setItem("takafulCoverageIncome10Y", String(coverageIncome10Y));
  localStorage.setItem("takafulCoverageExpenses10Y", String(coverageExpenses10Y));
  
  // --- END NEW ---

  const ciEl = document.getElementById('coverageIncome'); 
  const ceEl = document.getElementById('coverageExpenses');
  if (ciEl) ciEl.textContent = formatRM(coverageIncome);
  if (ceEl) ceEl.textContent = formatRM(coverageExpenses);
  
  // Keep the old keys to store the *currently displayed* value for backward compatibility/other logic
  localStorage.setItem("takafulCoverageIncome", String(coverageIncome)); 
  localStorage.setItem("takafulCoverageExpenses", String(coverageExpenses));
  
  const defaultSelected = "expenses";
  const displayedValue = defaultSelected === "income" ? coverageIncome : coverageExpenses;
  
  localStorage.setItem("takafulResult", String(displayedValue));
  localStorage.setItem("takafulPlan", plan);
  localStorage.setItem("lifeProtection", String(displayedValue));
  
  // animate display
  const result = document.getElementById('resultSectionTakaful');
  if (result) {
    result.classList.add('animate-fadeIn');
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function updateLifeProtectionFromBase(selectedBase) {
  // 🔑 Updated to retrieve the dedicated 10-Year storage keys
  const takafulCoverageIncome = parseFloat(localStorage.getItem("takafulCoverageIncome10Y") || "0");
  const takafulCoverageExpenses = parseFloat(localStorage.getItem("takafulCoverageExpenses10Y") || "0");

  const lifeProtection = document.getElementById("lifeProtection");
  const retrievedValue = document.getElementById("retrievedValue");

  // Always retrieve only the 10-year values from takaful calculation
  let coverage = selectedBase === "income" 
    ? takafulCoverageIncome 
    : takafulCoverageExpenses;

  // Safety fallback (should rarely happen)
  if (!coverage || coverage <= 0) coverage = 0;

  if (lifeProtection) {
    lifeProtection.value = Number(coverage).toLocaleString();
  }

  if (retrievedValue) {
    retrievedValue.textContent = `Retrieved 10-Year Coverage Based On ${
      selectedBase === "income" ? "Income" : "Expenses"
    }: RM ${Number(coverage).toLocaleString()}`;
    retrievedValue.classList.remove("hidden");
  }

  // Save selected base + value used
  localStorage.setItem("takafulBase", selectedBase);
  // Store the 10-year coverage value in the result keys
  localStorage.setItem("takafulResult", String(coverage)); 
  localStorage.setItem("lifeProtection", String(coverage));
}


function initializeTNAData() {
  const storedLiabilities = parseFloat(localStorage.getItem("totalLiabilities") || "0") || 0;
  const storedAssets = parseFloat(localStorage.getItem("totalAssets") || "0") || 0; 
  const protectionType = document.getElementById("protectionType");
  const existingLiabilitiesInput = document.getElementById("existingLiabilities");
  const assetFieldDisplay = document.getElementById("tnaTotalAssetsInput"); 
    
  if (existingLiabilitiesInput) {
    existingLiabilitiesInput.value = storedLiabilities ? Number(storedLiabilities).toLocaleString() : "";
  }

  if (assetFieldDisplay) {
    assetFieldDisplay.value = formatRM(storedAssets);
  }

  if (protectionType) {
    const takafulCoverageExpenses = parseFloat(localStorage.getItem("takafulCoverageExpenses") || "0") || 0;
    const prevBase = localStorage.getItem("takafulBase") || ""; 
        
    if (prevBase === "income" || prevBase === "expenses") {
      protectionType.value = prevBase;
    } 
    else {
      protectionType.value = takafulCoverageExpenses > 0 ? "expenses" : "income";
    }
    updateLifeProtectionFromBase(protectionType.value);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Attach change listener for the protection type dropdown
  const protectionType = document.getElementById("protectionType");
  if (protectionType) {
    protectionType.addEventListener("change", () => {
      updateLifeProtectionFromBase(protectionType.value);
    });
  }
    initializeTNAData();
});

//tna calculation
function calculateNeeds() {
  let lifeProtRaw = document.getElementById("lifeProtection").value || localStorage.getItem("lifeProtection") || "0";
  const lifeProt = parseFloat(String(lifeProtRaw).replace(/,/g, "")) || 0;
  const liabilitiesRaw = document.getElementById("existingLiabilities").value || localStorage.getItem("totalLiabilities") || "0";
  const liabilities = parseFloat(String(liabilitiesRaw).replace(/,/g, "")) || 0;
  const education = parseFloat((document.getElementById("estimatedChildEducation").value || "0").replace(/,/g, "")) || 0;
  const totalAssets = parseFloat((localStorage.getItem("totalAssets") || "0").replace(/,/g, "")) || 0;
  const life = parseFloat((document.getElementById("life").value || "0").replace(/,/g, "")) || 0;

  const totalNeeds = lifeProt + liabilities + education;
  const totalAssetsCoverage = totalAssets + life;
  const remainingGap = totalNeeds - totalAssetsCoverage;

  const absGap = Math.abs(remainingGap);
  const resultElement = document.getElementById("remainingGap");

  // display results
  document.getElementById("totalNeeds").textContent = "RM " + Number(totalNeeds).toLocaleString();
  document.getElementById("totalAssetsCoverage").textContent = "RM " + Number(totalAssetsCoverage).toLocaleString();
  resultElement.textContent = "RM " + Number(absGap).toLocaleString();

  resultElement.classList.remove('text-yellow-600', 'text-red-600', 'text-green-600', 'text-blue-600');

  let statusMessage = '';
  if (remainingGap > 0) {
    resultElement.classList.add('text-red-600');
    statusMessage = `You have a financial **shortfall** of RM ${Number(absGap).toLocaleString()}. Consider increasing your coverage.`;
  } else if (remainingGap < 0) {
    resultElement.classList.add('text-green-600');
    statusMessage = `You have a financial **surplus** of RM ${Number(absGap).toLocaleString()}. Your coverage is sufficient.`;
  } else {
    resultElement.classList.add('text-blue-600');
    statusMessage = `Your needs and coverage are perfectly balanced!`;
  }
  document.getElementById("gapMessage").innerText = statusMessage;
}

function calculateRetirement() {
  const currentAge = getNumericValue("retCurrentAge");
  const retAge = getNumericValue("retAge");
  const maxAge = getNumericValue("maxAge");
  if (currentAge <= 0 || retAge <= 0 || maxAge <= 0 || retAge <= currentAge) {
    alert("Please check your Age inputs. Retirement Age must be greater than Current Age.");
  return;
  }

  const n  = retAge - currentAge; // until retirement
  const n1 = maxAge - retAge; // during retirement
  
  // Economic assumptions
  const annualExpPct = getNumericValue("annualExpPct", true); // % of salary
  const i = getNumericValue("inflationRateRet", true); // Inflation
  const g_ret = getNumericValue("retInvReturn", true); // Return during retirement
  
  const currentSalary = Number(
  document.getElementById("retCurrentSalary").value.replace(/[^\d.-]/g, "")) || 0;

  // part 1 fund needed
  const PV1 = currentSalary * annualExpPct; //Current salary × % needed
  const projectedAnnualExpense = PV1 * Math.pow(1 + i, n); //Inflate PV1 until retirement
  const r_adjusted = ((1 + g_ret) / (1 + i)) - 1; //Inflation-adjusted discount rate
  let retirementFundNeeded = 0;

  if (Math.abs(r_adjusted) < 0.000001) {
    retirementFundNeeded = projectedAnnualExpense * n1;
  } else {
    retirementFundNeeded = projectedAnnualExpense * ((1 - Math.pow(1 + r_adjusted, -n1)) / r_adjusted);
  }

  //part 2 available funds
  // EPF values
  const PV3 = getNumericValue("retCurrentFund");
  const r1 = getNumericValue("epfReturn", true);
  const PMT2 = getNumericValue("annualEpfContribution");
  const g_salary = getNumericValue("salaryIncrementRate", true);
  const EPF1 = PV3 * Math.pow(1 + r1, n); // EPF Existing (Lump Sum FV)
  // EPF Future contributions (Growing annuity)
  let EPF2 = 0;
  if (Math.abs(r1 - g_salary) < 0.000001) {
    EPF2 = PMT2 * n * Math.pow(1 + r1, n - 1);
  } else {
    EPF2 = PMT2 * ((Math.pow(1 + r1, n) - Math.pow(1 + g_salary, n)) / (r1 - g_salary));
  }

  //other funds
  function calculateFundFV(PV, r, PMT, years) {
    const lump = PV * Math.pow(1 + r, years);
    const annuity = PMT > 0 ? (r === 0 ? PMT * years : PMT * ((Math.pow(1 + r, years) - 1) / r)) : 0;
    return lump + annuity;
  }

  const FV1 = calculateFundFV(getNumericValue("fund1Value"), getNumericValue("fund1Return", true), getNumericValue("fund1AnnualInv"), n);
  const FV2 = calculateFundFV(getNumericValue("fund2Value"), getNumericValue("fund2Return", true), getNumericValue("fund2AnnualInv"), n);
  const projectedAvailableFund = EPF1 + EPF2 + FV1 + FV2;  
  
  document.getElementById("fund1ProjectedValue").textContent = formatRM(FV1);
  document.getElementById("fund2ProjectedValue").textContent = formatRM(FV2);
  
  const retirementGap = retirementFundNeeded - projectedAvailableFund;
  const absGap = Math.abs(retirementGap);

  // Update UI
  document.getElementById("retFundNeeded").textContent = formatRM(retirementFundNeeded);
  document.getElementById("retFundAvailable").textContent = formatRM(projectedAvailableFund);

  const gapElement = document.getElementById("retGap");
  const messageElement = document.getElementById("retGapMessage");
  // Reset classes
  gapElement.classList.remove("text-pink-600", "text-green-600", "text-blue-600");

  let message = "";
  if (retirementGap > 0) {
    gapElement.classList.add("text-pink-600");
    gapElement.textContent = "- " + formatRM(absGap); message = `You have a projected shortfall of <strong>${formatRM(absGap)}</strong>.<br>Consider increasing your EPF contributions or additional investments.`;
  }
  else if (retirementGap < 0) {
    gapElement.classList.add("text-green-600");
    gapElement.textContent = "+ " + formatRM(absGap);
    message = `Great job! You have a projected surplus of <strong>${formatRM(absGap)}</strong>.<br>Your retirement plan is on track.`;
  } 
  else {
    gapElement.classList.add("text-blue-600");
    gapElement.textContent = "RM 0.00";
    message = `Your projected funds match your estimated needs.`;
  }
  messageElement.innerHTML = message;
  // Show section
  const resultsSection = document.getElementById("retResultsSection");
  if (resultsSection) resultsSection.classList.remove("hidden");
  }

function initializeRetirementData() {
  const storedMonthlySalary = parseFloat(localStorage.getItem("totalSalary") || "0") || 0;
  const annualSalary = storedMonthlySalary * 12;
  const retirementFundInput = document.getElementById("retirementFund"); 
  const retirementFundInputValue = retirementFundInput ? retirementFundInput.getRawValue() : "0";
  const storedEPF_raw = retirementFundInputValue || localStorage.getItem("retirementFund") || localStorage.getItem("retirementFundValue") || localStorage.getItem("mainRetirementFundValue") || "0";
  const storedEPF = parseFloat(String(storedEPF_raw).replace(/[^\d.-]/g, "")) || 0; 
    
  // Get element references
  const salaryInput = document.getElementById("retCurrentSalary");
  const epfInput = document.getElementById("retCurrentFund");
  const currentAgeInput = document.getElementById("retCurrentAge");

  if (currentAgeInput && !currentAgeInput.value) {
    currentAgeInput.value = 30;
  }

  if (salaryInput) {
    salaryInput.readOnly = true;
    salaryInput.classList.add("bg-gray-100");
    salaryInput.value = annualSalary > 0 ? Number(annualSalary).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
  }

  if (epfInput) {
    epfInput.readOnly = true;
    epfInput.classList.add("bg-gray-100");      
    epfInput.value = storedEPF > 0 ? Number(storedEPF).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
  }
}

function calculateInvestment() {

    function parseRM(value) {
        if (!value) return 0;
        return Number(value.toString().replace(/[^0-9.-]/g, "")) || 0;
    }

    function futureValue(PV, r, n, annual) {
        const growth = Math.pow(1 + r, n);
        const fvPV = PV * growth;
        const fvPMT = r > 0 ? annual * ((growth - 1) / r) : annual * n;
        return fvPV + fvPMT;
    }

    // Fund 1
    const f1PV = parseRM(document.getElementById("invFund1Value").value);
    const f1R = Number(document.getElementById("invFund1Return").value) / 100;
    const f1PMT = parseRM(document.getElementById("invFund1AnnualInv").value);
    const f1N = Number(document.getElementById("invFund1Years").value);

    const f1FV = futureValue(f1PV, f1R, f1N, f1PMT);
    document.getElementById("invFund1Projected").textContent = formatRM(f1FV);

    // Fund 2
    const f2PV = parseRM(document.getElementById("invFund2Value").value);
    const f2R = Number(document.getElementById("invFund2Return").value) / 100;
    const f2PMT = parseRM(document.getElementById("invFund2AnnualInv").value);
    const f2N = Number(document.getElementById("invFund2Years").value);

    const f2FV = futureValue(f2PV, f2R, f2N, f2PMT);
    document.getElementById("invFund2Projected").textContent = formatRM(f2FV);

    // Total
    const total = f1FV + f2FV;
    document.getElementById("invTotalProjected").textContent = formatRM(total);

    // Optional message
    document.getElementById("invMessage").textContent =
        "Based on your inputs, your combined investment projection is shown above.";

    // Make sure result section is visible
    document.getElementById("invResultsSection").classList.remove("hidden");
}

// Auto-run sync on load
document.addEventListener("DOMContentLoaded", initializeRetirementData);

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach(btn => {
    btn.classList.remove("active-tab", "border-blue-500");
    btn.classList.add("text-gray-500");
  });

  tabContents.forEach(tc => tc.classList.add("hidden"));

  const defaultTab = document.querySelector("[data-tab='takafulTab']");
  const defaultContent = document.getElementById("takafulTab");

  defaultTab.classList.add("active-tab", "border-blue-500");
  defaultTab.classList.remove("text-gray-500");

  defaultContent.classList.remove("hidden");
  
  tabButtons.forEach(btn => 
  {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tab;
      
      tabButtons.forEach(b => {
        b.classList.remove("active-tab", "border-blue-500");
        b.classList.add("text-gray-500");
      });

      tabContents.forEach(tc => tc.classList.add("hidden"));
      
      btn.classList.add("active-tab", "border-blue-500");
      btn.classList.remove("text-gray-500");
      
      document.getElementById(targetId).classList.remove("hidden");
      if (targetId === "tnaTab") {
        initializeTNAData();
      }

      if (targetId === "retirementTab") {
        initializeRetirementData();
      }
    });
  });
});