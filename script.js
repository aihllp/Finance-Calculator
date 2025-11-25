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
 * Helper function to safely retrieve numeric input values,
 * handling commas, "RM" prefix, converting percentages to decimals, and providing a default of 0.
 * @param {string} id - The element ID.
 * @param {boolean} isPercentage - Whether the input should be divided by 100.
 * @returns {number} The cleaned numeric value.
 */

function getNumericValue(id, isPercentage = false) {
    const element = document.getElementById(id);
    if (!element) return 0;

    let value = element.value || element.placeholder || '0';
    
    // If it's a .num-input field, we use its custom raw value method
    if (typeof element.getRawValue === 'function') {
        // Use the raw value if available (it handles unformatting commas)
        value = element.getRawValue();
    } else {
        // Standard cleanup for other number inputs or read-only fields
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

    // FORMAT WHILE TYPING
    input.addEventListener("input", (e) => {
      let raw = unformatNumber(e.target.value);

      // allow only numbers
      raw = raw.replace(/\D/g, "");

      // apply comma formatting
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
  const debtServiceRatio = income === 0 ? 0 : ((creditCardRepayment + vehicleLoanRepayment + propertyLoanRepayment) / income) * 100;

  showResultsSection();

  document.getElementById("cashflow").textContent = formatRM(cashFlowVal);
  document.getElementById("networth").textContent = formatRM(networth);
  document.getElementById("wealthratio").textContent = currentWealthRatio === Infinity ? "∞" : currentWealthRatio.toFixed(2);
  document.getElementById("savingsratio").textContent = savingsratio.toFixed(2) + "%";
  document.getElementById("liquidityratio").textContent = liquidityratio === Infinity ? "∞" : liquidityratio.toFixed(2);
  document.getElementById("debtServiceRatio").textContent = debtServiceRatio.toFixed(2) + "%";

  // Determine health label based on Wealth Ratio
  wealthRatio = currentWealthRatio === Infinity ? 200 : Math.max(0, Math.min(currentWealthRatio, 200));

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

  if (savedLiabilities > 0) {
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
    if (userValue < benchmarkValue) resultColor = "#16a34a"; // green
    else if (userValue === benchmarkValue) resultColor = "#facc15"; // yellow
    else resultColor = "#dc2626"; // red
  } else {
    if (userValue > benchmarkValue) resultColor = "#16a34a"; // green
    else if (userValue === benchmarkValue) resultColor = "#facc15"; // yellow
    else resultColor = "#dc2626"; // red
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
        legend: {
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
      animation: { duration: 900, easing: "easeOutQuart" },
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
    btn.addEventListener("click", () => {
      // Reset all tabs
      tabButtons.forEach(b => {
        b.classList.remove("active-tab", "text-gray-700", "border-blue-500");
        b.classList.add("text-gray-500");
      });
      tabContents.forEach(tc => tc.classList.add("hidden"));

      // Activate selected tab
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

  const netSavings = salary - expenses; //calculate net saving

  //calculation for takaful coverage
  let multiplier;
  switch (plan) {
    case "oneYear": multiplier = 12; break;
    case "fiveYear": multiplier = 60; break;
    case "tenYear": multiplier = 120; break;
    default: multiplier = 12;
  }

  const coverageIncome = salary * multiplier;
  const coverageExpenses = expenses * multiplier;

  // show values in takaful UI
  const ciEl = document.getElementById('coverageIncome');
  const ceEl = document.getElementById('coverageExpenses');
  if (ciEl) ciEl.textContent = formatRM(coverageIncome);
  if (ceEl) ceEl.textContent = formatRM(coverageExpenses);

  // store both income-based and expenses-based coverage so TNA can choose later
  localStorage.setItem("takafulCoverageIncome", String(coverageIncome));
  localStorage.setItem("takafulCoverageExpenses", String(coverageExpenses));

  // Also set a convenience key "takafulResult" to the currently displayed value (default: expenses)
  // NOTE: TNA will compute final lifeProtection based on the dropdown; this is just a convenience.
  const defaultSelected = "expenses";
  const displayedValue = defaultSelected === "income" ? coverageIncome : coverageExpenses;
  localStorage.setItem("takafulResult", String(displayedValue));
  localStorage.setItem("takafulPlan", plan); // store plan name (oneYear/fiveYear/tenYear)
  localStorage.setItem("lifeProtection", String(displayedValue)); // Ensure TNA base protection is updated

  // animate display
  const result = document.getElementById('resultSectionTakaful');
  if (result) {
    result.classList.add('animate-fadeIn');
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// Function that was partially in DOMContentLoaded - centralized here for re-use
function updateLifeProtectionFromBase(selectedBase) {
  // read stored values
  const storedIncome = parseFloat(localStorage.getItem("totalSalary") || localStorage.getItem("monthlyIncome") || "0") || 0;
  const storedExpenses = parseFloat(localStorage.getItem("totalExpenses") || localStorage.getItem("monthlyExpenses") || "0") || 0;
  const takafulCoverageIncome = parseFloat(localStorage.getItem("takafulCoverageIncome") || "0") || 0;
  const takafulCoverageExpenses = parseFloat(localStorage.getItem("takafulCoverageExpenses") || "0") || 0;

  const lifeProtection = document.getElementById("lifeProtection");
  const retrievedValue = document.getElementById("retrievedValue");

  let coverage = 0;
  // prefer explicit stored coverage amounts (from index) if present, else compute from stored income/expenses (defaulting to 10 years if original plan is unknown)
  if (selectedBase === "income") {
    coverage = takafulCoverageIncome > 0 ? takafulCoverageIncome : (storedIncome * 12 * 10);
  } else {
    coverage = takafulCoverageExpenses > 0 ? takafulCoverageExpenses : (storedExpenses * 12 * 10);
  }

  if (lifeProtection) lifeProtection.value = Number(coverage).toLocaleString();
  if (retrievedValue) {
    retrievedValue.textContent = `Based on ${selectedBase === "income" ? "Monthly Income" : "Monthly Expenses"}: RM ${selectedBase === "income" ? Number(storedIncome).toLocaleString() : Number(storedExpenses).toLocaleString()} → 10-Year Coverage: RM ${Number(coverage).toLocaleString()}`;
    retrievedValue.classList.remove("hidden");
  }

  // persist the chosen base and computed coverage
  localStorage.setItem("takafulBase", selectedBase);
  localStorage.setItem("takafulResult", String(coverage));
  localStorage.setItem("lifeProtection", String(coverage));
}

function initializeTNAData() {
    // 1. Retrieve the latest values from localStorage
    const storedLiabilities = parseFloat(localStorage.getItem("totalLiabilities") || "0") || 0;
    const storedAssets = parseFloat(localStorage.getItem("totalAssets") || "0") || 0;
    
    // 2. Get references to TNA elements
    const protectionType = document.getElementById("protectionType");
    const existingLiabilitiesInput = document.getElementById("existingLiabilities");
    // *** FIX: Changed from 'totalAssets' to 'tnaTotalAssetsInput' ***
    const assetFieldDisplay = document.getElementById("tnaTotalAssetsInput"); 
    
    // 3. Update Liabilities Input (It's a num-input, format with commas but NO "RM")
    if (existingLiabilitiesInput) {
        // We use toLocaleString() for display with commas
        existingLiabilitiesInput.value = storedLiabilities ? Number(storedLiabilities).toLocaleString() : "";
    }

    // 4. Update Assets Display (Read-only input field, format with "RM")
    if (assetFieldDisplay) {
        // Assets are read-only and need the RM currency format
        assetFieldDisplay.value = formatRM(storedAssets);
    }

    // 5. Update Dropdown and Life Protection
    if (protectionType) {
        const takafulCoverageExpenses = parseFloat(localStorage.getItem("takafulCoverageExpenses") || "0") || 0;
        const prevBase = localStorage.getItem("takafulBase") || ""; 
        
        // Set dropdown value (either previously saved base or default to 'expenses')
        if (prevBase === "income" || prevBase === "expenses") {
            protectionType.value = prevBase;
        } else {
            protectionType.value = takafulCoverageExpenses > 0 ? "expenses" : "income";
        }

        // Calculate/display the life protection based on the selected base
        updateLifeProtectionFromBase(protectionType.value);
    }
}

/**
 * Initializes the read-only fields on the retirement tab using saved financial data.
 */
function initializeRetirementData() {
    // Current Salary (PV for Projected Annual Expenses)
    const storedSalary = parseFloat(localStorage.getItem("totalSalary") || "0") || 0;
    // Existing Retirement Fund (PV3 for EPF1 projection)
    const storedRetirementFund = parseFloat(localStorage.getItem("mainRetirementFundValue") || "0") || 0; 
    
    // Get element references
    const salaryInput = document.getElementById("retCurrentSalary");
    const fundInput = document.getElementById("currentRetFund");
    
    // Populate Current Age with a default if empty (e.g., 30)
    const currentAgeInput = document.getElementById("retCurrentAge");
    if (currentAgeInput && !currentAgeInput.value) {
        currentAgeInput.value = 30;
    }

    // Populate Current Salary (Read-only)
    if (salaryInput) {
        salaryInput.value = formatRM(storedSalary);
    }
    
    // Populate Total Existing Retirement Fund (PV3)
    if (fundInput) {
        // Display with comma formatting, without RM for easier parsing
        fundInput.value = storedRetirementFund ? Number(storedRetirementFund).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "";
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
  // get lifeProtection from the lifeProtection input or fallback to localStorage
  let lifeProtRaw = document.getElementById("lifeProtection").value || localStorage.getItem("lifeProtection") || "0";
  const lifeProt = parseFloat(String(lifeProtRaw).replace(/,/g, "")) || 0;

  const liabilitiesRaw = document.getElementById("existingLiabilities").value || localStorage.getItem("totalLiabilities") || "0";
  const liabilities = parseFloat(String(liabilitiesRaw).replace(/,/g, "")) || 0;

  const education = parseFloat((document.getElementById("estimatedChildEducation").value || "0").replace(/,/g, "")) || 0;
  const totalAssets = parseFloat((localStorage.getItem("totalAssets") || "0").replace(/,/g, "")) || 0;
  const life = parseFloat((document.getElementById("life").value || "0").replace(/,/g, "")) || 0;

  const totalNeeds = lifeProt + liabilities + education;
  const totalAssetsCoverage = totalAssets + life;
  
  // Calculate remainingGap: Positive if Shortfall (Needs > Assets), Negative if Surplus (Assets > Needs)
  const remainingGap = totalNeeds - totalAssetsCoverage;

  const absGap = Math.abs(remainingGap);
  const resultElement = document.getElementById("remainingGap");

  // display results
  document.getElementById("totalNeeds").textContent = "RM " + Number(totalNeeds).toLocaleString();
  document.getElementById("totalAssetsCoverage").textContent = "RM " + Number(totalAssetsCoverage).toLocaleString();
  
  // 1. Display the absolute value
  resultElement.textContent = "RM " + Number(absGap).toLocaleString();

  // 2. Clear existing color classes
  resultElement.classList.remove('text-yellow-600', 'text-red-600', 'text-green-600', 'text-blue-600');

  let statusMessage = '';
  
  if (remainingGap > 0) {
    // Shortfall
    resultElement.classList.add('text-red-600');
    statusMessage = `You have a financial **shortfall** of RM ${Number(absGap).toLocaleString()}. Consider increasing your coverage.`;
  } else if (remainingGap < 0) {
    // Surplus
    resultElement.classList.add('text-green-600');
    statusMessage = `You have a financial **surplus** of RM ${Number(absGap).toLocaleString()}. Your coverage is sufficient.`;
  } else {
    // Balanced
    resultElement.classList.add('text-blue-600');
    statusMessage = `Your needs and coverage are perfectly balanced!`;
  }
  
  // 3. Update the message
  document.getElementById("gapMessage").innerText = statusMessage;
}

// =========================================================================
// RETIREMENT CALCULATOR LOGIC (FOLLOWING USER'S SPECIFICATION)
// =========================================================================

/**
 * Calculates the required retirement fund, projected available fund, and the resulting gap/surplus.
 * NOTE: Assumes getNumericValue and formatRM helper functions are available.
 */
function calculateRetirement() {
    // -------------------------------------------------------------------------
    // A. INPUTS
    // -------------------------------------------------------------------------
    
    // 1. Time Variables
    const currentAge = getNumericValue("retCurrentAge");
    const retAge = getNumericValue("retAge");
    const maxAge = getNumericValue("maxAge");
    
    // Validation
    if (currentAge <= 0 || retAge <= 0 || maxAge <= 0 || retAge <= currentAge) {
        alert("Please check your Age inputs. Retirement Age must be greater than Current Age.");
        return;
    }

    const n = retAge - currentAge;       // Gap to retirement (Accumulation phase)
    const n1 = maxAge - retAge;          // Retirement duration (Decumulation phase)

    // 2. Economic Assumptions
    const annualExpPct = getNumericValue("annualExpPct", true);   // % of salary needed
    const i = getNumericValue("inflationRateRet", true);          // Inflation rate
    const g_ret = getNumericValue("retInvReturn", true);          // Investment return DURING retirement
    
    // 3. Financial Data
    const currentSalary = getNumericValue("retCurrentSalary");
    
    // -------------------------------------------------------------------------
    // B. PART 1: CALCULATION RETIREMENT FUND NEEDED
    // -------------------------------------------------------------------------
    
    // 1st - Projected Annual Expenses at Retirement Age (Future Value)
    // Formula: FV = PV x (1+i)^n
    // PV1 = % x Current Salary
    const PV1 = currentSalary * annualExpPct;
    const projectedAnnualExpense = PV1 * Math.pow(1 + i, n);

    // 2nd - Total Fund Needed at Retirement (Present Value of Annuity at start of retirement)
    // Formula: PV2 = PMT x [ (1 - (1+r)^(-n1)) / r ]
    // Where r = inflation adjusted return: [(1+g)/(1+i)] - 1
    
    const r_adjusted = ((1 + g_ret) / (1 + i)) - 1;
    
    let retirementFundNeeded = 0;
    
    // Handle division by zero if r_adjusted is 0
    if (Math.abs(r_adjusted) < 0.000001) {
        retirementFundNeeded = projectedAnnualExpense * n1;
    } else {
        retirementFundNeeded = projectedAnnualExpense * ((1 - Math.pow(1 + r_adjusted, -n1)) / r_adjusted);
    }

    // -------------------------------------------------------------------------
    // C. PART 2: AVAILABLE RETIREMENT FUND (EPF + OTHERS)
    // -------------------------------------------------------------------------

    // --- SECTION 1: EPF ---
    const PV3 = getNumericValue("currentRetFund");      // Existing EPF
    const r1 = getNumericValue("epfReturn", true);      // EPF Return
    const PMT2 = getNumericValue("annualEpfContribution"); // Annual Contribution
    const g_salary = getNumericValue("salaryIncrementRate", true); // Salary Increment

    // 1. Projection Existing EPF Fund (Lump Sum FV)
    // Formula: EPF1 = PV3 x (1+r1)^n
    const EPF1 = PV3 * Math.pow(1 + r1, n);

    // 2. Projection Future Contribution Growth (Growing Annuity FV)
    // Formula: EPF2 = PMT2 x [ ((1+r1)^n - (1+g)^n) / (r1 - g) ]
    let EPF2 = 0;
    if (Math.abs(r1 - g_salary) < 0.000001) {
        // Special case where return = growth
        EPF2 = PMT2 * n * Math.pow(1 + r1, n - 1); 
    } else {
        EPF2 = PMT2 * ((Math.pow(1 + r1, n) - Math.pow(1 + g_salary, n)) / (r1 - g_salary));
    }

    // --- SECTION 2: OTHER FUNDS ---
    
    // Helper function for Other Funds formula: FV = [PV * (1+r)^n] + [PMT * FV_Annuity_Factor]
    // Note: Reference doc annuity formula had a typo (PV formula), used standard FV Annuity formula 
    // ((1+r)^n - 1)/r to correctly calculate "Fund Value at Retirement age".
    function calculateFundFV(PV, r, PMT, years) {
        const lumpSumFV = PV * Math.pow(1 + r, years);
        let annuityFV = 0;
        if (PMT > 0) {
            if (r === 0) {
                annuityFV = PMT * years;
            } else {
                annuityFV = PMT * ((Math.pow(1 + r, years) - 1) / r);
            }
        }
        return lumpSumFV + annuityFV;
    }

    // Fund 1
    const fund1PV = getNumericValue("fund1Value");
    const r2 = getNumericValue("fund1Return", true);
    const PMT3 = getNumericValue("fund1AnnualInv");
    const FV1 = calculateFundFV(fund1PV, r2, PMT3, n);

    // Fund 2
    const fund2PV = getNumericValue("fund2Value");
    const r3 = getNumericValue("fund2Return", true);
    const PMT4 = getNumericValue("fund2AnnualInv");
    const FV2 = calculateFundFV(fund2PV, r3, PMT4, n);

    // TOTAL AVAILABLE
    const projectedAvailableFund = EPF1 + EPF2 + FV1 + FV2;

    // -------------------------------------------------------------------------
    // D. RESULTS & DISPLAY
    // -------------------------------------------------------------------------
    
    // Objective: Shortfall/Surplus = Available - Needed (Or Needed - Available, depending on view)
    // Doc says: Needed - Available = Shortfall
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
        // Shortfall
        gapElement.classList.add("text-pink-600");
        gapElement.textContent = "- " + formatRM(absGap); // Indicate negative impact
        message = `You have a projected shortfall of <strong>${formatRM(absGap)}</strong>. <br>Consider increasing your EPF contributions or starting a private retirement scheme.`;
    } else if (retirementGap < 0) {
        // Surplus
        gapElement.classList.add("text-green-600");
        gapElement.textContent = "+ " + formatRM(absGap);
        message = `Great job! You have a projected surplus of <strong>${formatRM(absGap)}</strong>. <br>Your retirement plan is on track.`;
    } else {
        // Balanced
        gapElement.classList.add("text-blue-600");
        gapElement.textContent = formatRM(0);
        message = "Your projected funds perfectly match your estimated needs.";
    }

    messageElement.innerHTML = message;

    // Show results
    const resultsSection = document.getElementById("retResultsSection");
    if (resultsSection) {
        resultsSection.classList.remove("hidden");
        // Optional: scroll to results
    }
}

document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  // 1. Remove active style from ALL tabs
  tabButtons.forEach(btn => {
    btn.classList.remove("active-tab", "border-blue-500");
    btn.classList.add("text-gray-500");
  });

  // 2. Hide all tab contents
  tabContents.forEach(tc => tc.classList.add("hidden"));

  // 3. Set DEFAULT active tab = Takaful
  const defaultTab = document.querySelector("[data-tab='takafulTab']");
  const defaultContent = document.getElementById("takafulTab");

  // Highlight Takaful button
  defaultTab.classList.add("active-tab", "border-blue-500");
  defaultTab.classList.remove("text-gray-500");

  // Show Takaful content
  defaultContent.classList.remove("hidden");

  // 4. Set click behaviour
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tab;

      // Reset all tabs
      tabButtons.forEach(b => {
        b.classList.remove("active-tab", "border-blue-500");
        b.classList.add("text-gray-500");
      });

      // Hide all contents
      tabContents.forEach(tc => tc.classList.add("hidden"));

      // Activate clicked tab
      btn.classList.add("active-tab", "border-blue-500");
      btn.classList.remove("text-gray-500");

      // Show target content
      document.getElementById(targetId).classList.remove("hidden");

      if (targetId === "tnaTab") {
        initializeTNAData(); // 2. Call the function when the TNA tab is clicked
      }
    });
  });
});