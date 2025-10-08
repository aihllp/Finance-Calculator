function formatRM(n) {
  if (!isFinite(n)) return "∞";
  return "RM " + Number(n).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
let savingsChartInstance = null;
let liquidityChartInstance = null;
let debtChartInstance = null;
let wealthRatio = 0;
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
  const healthScore = Math.min(((savingsratio / 100) * 40 + Math.min(liquidityratio, 10) * 3 + Math.max(0, (100 - debtServiceRatio)) * 0.5), 100);
  document.getElementById("health").textContent = healthScore.toFixed(1) + "%";
  const bar = document.getElementById("health-fill");
  bar.style.transition = "width 0.7s ease-in-out";
  bar.style.width = Math.max(healthScore, 5) + "%";
  wealthRatio = currentWealthRatio === Infinity ? 200 : Math.max(0, Math.min(currentWealthRatio, 200));
  updateGaugeFromResult();
  updateRatiosChart(savingsratio, liquidityratio, debtServiceRatio);
}
const ctx = document.getElementById('healthGauge').getContext('2d');
const gaugeColors = [
  '#ff0000', '#ff9900', '#cccc00', '#66cc00',
  '#00cc66', '#0099cc', '#9933cc', '#000000'
];
const gaugeLabels = [
  '<1 Bankrap!', '1-5 Kritikal', '6-10 Normal', '10-20 Sihat',
  '21-50 Cergas', '50-96 Athlete', '>96 Olympic Athlete', '>168 A Free MAN!'
];
const gaugeDataWidths = [1, 5, 5, 10, 30, 46, 72, 72];
const gaugeNeedle = {
  id: 'gaugeNeedle',
  afterDatasetDraw(chart) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const xCoor = meta.data[0].x;
    const yCoor = meta.data[0].y;
    const outerRadius = meta.data[0].outerRadius;
    const angle = Math.PI + (wealthRatio / 200) * Math.PI;
    const needleRadius = outerRadius * 0.9;
    const needleX = xCoor + needleRadius * Math.cos(angle);
    const needleY = yCoor + needleRadius * Math.sin(angle);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xCoor, yCoor);
    ctx.lineTo(needleX, needleY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(xCoor, yCoor, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.restore();
  }
};
const wealthGauge = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: gaugeLabels,
    datasets: [{
      data: gaugeDataWidths,
      backgroundColor: gaugeColors,
      borderWidth: 1,
      borderColor: '#fff'
    }]
  },
  options: {
    rotation: -90,
    circumference: 180,
    cutout: '70%',
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    }
  },
  plugins: [gaugeNeedle]
});
function updateGaugeFromResult() {
  const ratioText = document.getElementById('wealthratio').innerText;
  let targetValue = parseFloat(ratioText) || 0;
  targetValue = Math.max(0, Math.min(targetValue, 200));
  const start = wealthRatio;
  const end = targetValue;
  let startTime = null;
  const duration = 1200;
  function animateNeedle(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    wealthRatio = start + (end - start) * progress;
    wealthGauge.update('none');
    if (progress < 1) {
      requestAnimationFrame(animateNeedle);
    }
  }
  requestAnimationFrame(animateNeedle);
}
function updateRatiosChart(savingsRatio, liquidityRatio, debtServiceRatio) {
  const savingsBenchmark = 10;
  const liquidityBenchmark = 3;
  const debtBenchmark = 35;
  if (savingsChartInstance) savingsChartInstance.destroy();
  if (liquidityChartInstance) liquidityChartInstance.destroy();
  if (debtChartInstance) debtChartInstance.destroy();
  savingsChartInstance = createMiniChart('savingsChart', 'Savings', Number(savingsRatio.toFixed(2)), savingsBenchmark);
  liquidityChartInstance = createMiniChart('liquidityChart', 'Liquidity', Number(liquidityRatio === Infinity ? 200 : liquidityRatio.toFixed(2)), liquidityBenchmark);
  debtChartInstance = createMiniChart('debtChart', 'Debt Service', Number(debtServiceRatio.toFixed(2)), debtBenchmark);
}
function createMiniChart(ctxId, label, userValue, benchmarkValue) {
  const ctx = document.getElementById(ctxId).getContext('2d');
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [label],
      datasets: [
        {
          label: 'Your Result',
          data: [userValue],
          backgroundColor: '#6366f1',
          borderRadius: 6,
        },
        {
          label: 'Benchmark',
          data: [benchmarkValue],
          backgroundColor: '#a5b4fc',
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
          ticks: { color: '#6b7280', stepSize: 10 },
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
  const takafulSection = document.getElementById("takafulButtonSection");
  [resultsSection, takafulSection].forEach(sec => {
    if (sec) {
      sec.classList.remove("hidden", "opacity-0", "pointer-events-none");
      sec.classList.add("opacity-100");
    }
  });
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 400);
}
function toggleInfo(id) {
  const info = document.getElementById(id + "-info");
  const card = info.parentElement;
  info.classList.toggle("show");
  card.classList.toggle("active");
}
AOS.init({ duration: 1000, once: true });