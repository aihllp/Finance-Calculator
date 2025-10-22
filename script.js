
// Format helper
function formatRM(n) {
  if (!isFinite(Number(n))) return "∞";
  return "RM " + Number(n).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Chart instances
let savingsChartInstance = null;
let liquidityChartInstance = null;
let debtChartInstance = null;
let wealthRatio = 0;

//store salary/expenses in memory instead of localStorage
let totalSalary = 0;
let totalExpenses = 0;

// Main calculate function (expanded)
function calculate() {
  const salary = Number(document.getElementById("salary").value) || 0;
  const otherIncome = Number(document.getElementById("otherIncome").value) || 0;
  const creditCardRepayment = Number(document.getElementById("creditCardRepayment").value) || 0;
  const vehicleLoanRepayment = Number(document.getElementById("vehicleLoanRepayment").value) || 0;
  const propertyLoanRepayment = Number(document.getElementById("propertyLoanRepayment").value) || 0;
  const personalHouseholdExpenses = Number(document.getElementById("personalHouseholdExpenses").value) || 0;
  const insuranceExpenses = Number(document.getElementById("insuranceExpenses").value) || 0;
  const otherExpenses = Number(document.getElementById("otherExpenses").value) || 0;
  const savings = Number(document.getElementById("savings").value) || 0;
  const propertyValue = Number(document.getElementById("propertyValue").value) || 0;
  const investmentsValue = Number(document.getElementById("investmentsValue").value) || 0;
  const retirementFund = Number(document.getElementById("retirementFund").value) || 0;
  const creditCardBalance = Number(document.getElementById("creditCardBalance").value) || 0;
  const vehicleLoanBalance = Number(document.getElementById("vehicleLoanBalance").value) || 0;
  const propertyFinancingBalance = Number(document.getElementById("propertyFinancingBalance").value) || 0;
  const otherLiabilities = Number(document.getElementById("otherLiabilities").value) || 0;

  const income = salary + otherIncome;
  const expenses = creditCardRepayment + vehicleLoanRepayment + propertyLoanRepayment + personalHouseholdExpenses + insuranceExpenses + otherExpenses;
  const assets = savings + propertyValue + investmentsValue + retirementFund;
  const liabilities = creditCardBalance + vehicleLoanBalance + propertyFinancingBalance + otherLiabilities;

  document.getElementById("totalIncome").textContent = formatRM(income);
  document.getElementById("totalExpenses").textContent = formatRM(expenses);
  document.getElementById("totalAssets").textContent = formatRM(assets);
  document.getElementById("totalLiabilities").textContent = formatRM(liabilities);

  const cashflowVal = income - expenses;
  const networth = assets - liabilities;
  const currentWealthRatio = expenses === 0 ? Infinity : (networth / expenses);
  const savingsratio = income === 0 ? 0 : ((income - expenses) / income) * 100;
  const liquidityratio = expenses === 0 ? Infinity : (assets / expenses);
  const debtServiceRatio = income === 0 ? 0 : ((creditCardRepayment + vehicleLoanRepayment + propertyLoanRepayment) / income) * 100;

  showResultsSection();

  document.getElementById("cashflow").textContent = formatRM(cashflowVal);
  document.getElementById("networth").textContent = formatRM(networth);
  document.getElementById("wealthratio").textContent = currentWealthRatio === Infinity ? "∞" : currentWealthRatio.toFixed(2);
  document.getElementById("savingsratio").textContent = savingsratio.toFixed(2) + "%";
  document.getElementById("liquidityratio").textContent = liquidityratio === Infinity ? "∞" : liquidityratio.toFixed(2);
  document.getElementById("debtServiceRatio").textContent = debtServiceRatio.toFixed(2) + "%";

  // Determine health label based on Wealth Ratio
  wealthRatio = currentWealthRatio === Infinity ? 200 : Math.max(0, Math.min(currentWealthRatio, 200));

  let healthText = "";
  let barColor = "#facc15"; // default yellow

  if (wealthRatio < 1) {
    healthText = "Bankrupt!";
    barColor = "#dc2626"; // red
  } else if (wealthRatio < 5) {
    healthText = "Critical";
    barColor = "#f87171"; // light red
  } else if (wealthRatio < 10) {
    healthText = "Normal";
    barColor = "#fbbf24"; // amber
  } else if (wealthRatio < 20) {
    healthText = "Healthy";
    barColor = "#34d399"; // green
  } else if (wealthRatio < 50) {
    healthText = "Fit";
    barColor = "#10b981"; // emerald
  } else if (wealthRatio < 96) {
    healthText = "Athlete";
    barColor = "#3b82f6"; // blue
  } else if (wealthRatio < 168) {
    healthText = "Olympic Athlete";
    barColor = "#6366f1"; // indigo
  } else {
    healthText = "A Free MAN!";
    barColor = "#a855f7"; // purple
  }

  document.getElementById("health").textContent = healthText;

  // Animate bar width & color
  const bar = document.getElementById("health-fill");
  bar.style.transition = "all 0.8s ease-in-out";
  bar.style.width = Math.min((wealthRatio / 200) * 100, 100) + "%";
  bar.style.backgroundColor = barColor;

  //updateGaugeFromResult();
  updateRatiosChart(savingsratio, liquidityratio, debtServiceRatio);

  //store values in memory
  totalSalary = income;
  totalExpenses = expenses;

  // Auto-update Takaful section immediately
  document.getElementById('salaryText').textContent = formatRM(income);
  document.getElementById('expensesText').textContent = formatRM(expenses);
  document.getElementById('netText').textContent = formatRM(income - expenses);
}

// Gauge plugin for needle
//const healthGaugeEl = document.getElementById('healthGauge');
//const ctxGauge = healthGaugeEl ? healthGaugeEl.getContext('2d') : null;
//const gaugeColors = [
  //'#ff0000', '#ff9900', '#cccc00', '#66cc00',
  //'#00cc66', '#0099cc', '#9933cc', '#000000'
//];
//const gaugeLabels = [
  //'<1 Bankrupt!', '1-5 Critical', '6-10 Normal', '10-20 Healthy',
  //'21-50 Fit', '50-96 Athlete', '>96 Olympic Athlete', '>168 A Free MAN!'
//];
//const gaugeDataWidths = [1, 5, 5, 10, 30, 46, 72, 72];

//const gaugeNeedle = {
  //id: 'gaugeNeedle',
  //afterDatasetDraw(chart) {
    //const { ctx } = chart;
    //const meta = chart.getDatasetMeta(0);
    //if (!meta || !meta.data || !meta.data[0]) return;
    //const xCoor = meta.data[0].x;
    //const yCoor = meta.data[0].y;
    //const outerRadius = meta.data[0].outerRadius;
    //const angle = Math.PI + (wealthRatio / 200) * Math.PI;
    //const needleRadius = outerRadius * 0.9;
    //const needleX = xCoor + needleRadius * Math.cos(angle);
    //const needleY = yCoor + needleRadius * Math.sin(angle);
    //ctx.save();
    //ctx.beginPath();
    //ctx.moveTo(xCoor, yCoor);
    //ctx.lineTo(needleX, needleY);
    //ctx.lineWidth = 3;
    //ctx.strokeStyle = 'black';
    //ctx.stroke();
    //ctx.beginPath();
    //ctx.arc(xCoor, yCoor, 5, 0, 2 * Math.PI);
    //ctx.fillStyle = 'black';
    //ctx.fill();
    //ctx.restore();
  //}
//};

// Create wealth gauge if canvas exists
//let wealthGauge = null;
//if (ctxGauge) {
  //wealthGauge = new Chart(ctxGauge, {
    //type: 'doughnut',
    //data: {
      //labels: gaugeLabels,
      //datasets: [{
        //data: gaugeDataWidths,
        //backgroundColor: gaugeColors,
        //borderWidth: 1,
        //borderColor: '#fff'
      //}]
    //},
    //options: {
      //rotation: -90,
      //circumference: 180,
      //cutout: '70%',
      //plugins: {
        //legend: {
          //display: true,
          //position: 'bottom'
        //}
      //}
    //},
    //plugins: [gaugeNeedle]
  //});
//}

//function updateGaugeFromResult() {
  //const ratioText = document.getElementById('wealthratio').innerText;
  //let targetValue = parseFloat(ratioText) || 0;
  //targetValue = Math.max(0, Math.min(targetValue, 200));
  //const start = wealthRatio;
  //const end = targetValue;
  //let startTime = null;
  //const duration = 1200;
  //function animateNeedle(timestamp) {
    //if (!startTime) startTime = timestamp;
    //const progress = Math.min((timestamp - startTime) / duration, 1);
    //wealthRatio = start + (end - start) * progress;
    //if (wealthGauge) wealthGauge.update('none');
    //if (progress < 1) {
      //requestAnimationFrame(animateNeedle);
    //}
  //}
  //requestAnimationFrame(animateNeedle);
//}

function updateRatiosChart(savingsRatio, liquidityRatio, debtServiceRatio) {
  const savingsBenchmark = 10;
  const liquidityBenchmark = 3;
  const debtBenchmark = 35;

  // Update colors based on benchmarks
  const savingsElem = document.getElementById("savingsratio");
  const liquidityElem = document.getElementById("liquidityratio");
  const debtElem = document.getElementById("debtServiceRatio");

  // --- Savings Ratio: higher is better (>10%)
  if (savingsElem) savingsElem.style.color = savingsRatio >= savingsBenchmark ? "#16a34a" : "#dc2626";

  // --- Liquidity Ratio: higher is better (≥3 months)
  const liquidityValue = liquidityRatio === Infinity ? 200 : liquidityRatio;
  if (liquidityElem) liquidityElem.style.color = liquidityValue >= liquidityBenchmark ? "#16a34a" : "#dc2626";

  // --- Debt Service Ratio: lower is better (<35%)
  if (debtElem) debtElem.style.color = debtServiceRatio <= debtBenchmark ? "#16a34a" : "#dc2626";

  // Recreate mini charts (destroy old ones first)
  if (savingsChartInstance) savingsChartInstance.destroy();
  if (liquidityChartInstance) liquidityChartInstance.destroy();
  if (debtChartInstance) debtChartInstance.destroy();

  savingsChartInstance = createMiniChart(
    "savingsChart",
    "Savings",
    Number(Number(savingsRatio).toFixed(2)),
    savingsBenchmark
  );
  liquidityChartInstance = createMiniChart(
    "liquidityChart",
    "Liquidity",
    Number(Number(liquidityValue).toFixed(2)),
    liquidityBenchmark
  );
  debtChartInstance = createMiniChart(
    "debtChart",
    "Debt Service",
    Number(Number(debtServiceRatio).toFixed(2)),
    debtBenchmark
  );
}

function createMiniChart(ctxId, label, userValue, benchmarkValue) {
  const el = document.getElementById(ctxId);
  if (!el) return null;
  const ctx = el.getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [label],
      datasets: [
        {
          label: 'Your Result',
          data: [userValue],
          borderRadius: 6,
        },
        {
          label: 'Benchmark',
          data: [benchmarkValue],
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { color: '#4b5563', font: { size: 11 } },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f3f4f6' },
          ticks: { color: '#6b7280' },
        },
        x: {
          grid: { display: false },
          ticks: { color: '#4b5563' },
        },
      },
      animation: { duration: 1000, easing: 'easeOutQuart' },
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

function toggleInfo(id) {
  const info = document.getElementById(id + "-info");
  if (!info) return;
  const card = info.parentElement;
  info.classList.toggle("show");
  card.classList.toggle("active");
}

AOS.init({ duration: 1000, once: true });

// Show Takaful Section and scroll to it + Takaful plan logic + back button
document.addEventListener('DOMContentLoaded', function () {
  const showTakafulBtn = document.getElementById('showTakafulBtn');
  const takafulSection = document.getElementById('takafulSection');

  if (showTakafulBtn && takafulSection) {
    showTakafulBtn.addEventListener('click', function () {
      // Expand (slide down) the takaful area
      takafulSection.classList.add('show');
      // Auto-scroll after a small delay so expansion starts
      setTimeout(() => {
        // keep the Proceed button visible (we do not hide it)
        takafulSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 420);

      document.getElementById('salaryText').textContent = totalSalary > 0 ? formatRM(totalSalary) : 'No data found';
      document.getElementById('expensesText').textContent = totalExpenses > 0 ? formatRM(totalExpenses) : 'No data found';
      document.getElementById('netText').textContent = (totalSalary > 0 && totalExpenses > 0)
        ? formatRM(totalSalary - totalExpenses)
        : 'No data found';
    });
  }

  // Collapse takaful section when going back and scroll to results
  //if (backToMain) {
    //backToMain.addEventListener('click', () => {
      // if (!takafulSection) return;
      // takafulSection.classList.remove('show');
      // setTimeout(() => {
      //   const resultsSection = document.getElementById('resultsSection');
      //   if (resultsSection) resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // }, 420);
    // });
  // }

  // Takaful plan logic (cards)
  document.querySelectorAll('.coverage-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.coverage-card').forEach(c => c.classList.remove('ring'));
      card.classList.add('ring');
      showCoverage(card.id);
    });
  });
});

// Takaful coverage calculation + chart
function showCoverage(plan) {
  const salary = totalSalary;
  const expenses = totalExpenses;

  if (salary <= 0 || expenses <= 0) {
    alert('No salary or expenses data found. Please calculate on the main page first.');
    return;
  }

  const netSavings = salary - expenses;
  let multiplier;
  switch (plan) {
    case "oneYear": multiplier = 8; break;
    case "fiveYear": multiplier = 50; break;
    case "tenYear": multiplier = 120; break;
    default: multiplier = 8;
  }

  const coverageIncome = salary * multiplier;
  const coverageExpenses = expenses * multiplier;

  document.getElementById('coverageIncome').textContent = `RM ${coverageIncome.toLocaleString()}`;
  document.getElementById('coverageExpenses').textContent = `RM ${coverageExpenses.toLocaleString()}`;

  const result = document.getElementById('resultSectionTakaful');
  if (result) {
    result.classList.add('animate-fadeIn');
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  //const result = document.getElementById('resultSectionTakaful');
  //result.classList.add('hidden');
  //result.scrollIntoView({ behavior: "smooth", block: "center" });

  //const ctx = document.getElementById('coverageChart').getContext('2d');
  //if (window.coverageChart) window.coverageChart.destroy();
  //window.coverageChart = new Chart(ctx, {
    //type: 'doughnut',
    //data: {
      //labels: ['Income-based', 'Expenses-based'],
      //datasets: [{
        //data: [coverageIncome, coverageExpenses],
        //backgroundColor: ['#3B82F6', '#93C5FD'],
        //borderWidth: 1,
      //}],
    //},
    //options: {
      //plugins: { legend: { display: true, position: 'bottom' } },
      //layout: { padding: 10 },
    //},
  //});
}