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

  // Financial status calculations
  const cashflow = income - expenses;
  const networth = assets - liabilities;
  const wealthratio = expenses === 0 ? Infinity : (networth / expenses);
  const savingsratio = income === 0 ? 0 : ((income - expenses) / income) * 100;
  const liquidityratio = expenses === 0 ? Infinity : (assets / expenses);
  const debtServiceRatio = income === 0 ? 0 : ((creditCardRepayment + vehicleLoanRepayment + propertyLoanRepayment) / income) * 100;

  // Update UI
  document.getElementById("cashflow").textContent = formatRM(cashflow);
  document.getElementById("networth").textContent = formatRM(networth);
  document.getElementById("wealthratio").textContent = wealthratio === Infinity ? "∞" : wealthratio.toFixed(2);
  document.getElementById("savingsratio").textContent = savingsratio.toFixed(2) + "%";
  document.getElementById("liquidityratio").textContent = liquidityratio === Infinity ? "∞" : liquidityratio.toFixed(2);
  document.getElementById("debtServiceRatio").textContent = debtServiceRatio.toFixed(2) + "%";

  updateGaugeFromResult();
}

AOS.init({
  duration: 1000,   // animation duration (1s)
  once: true        // animate only once
});

// Gauge chart using Chart.js
const ctx = document.getElementById('healthGauge').getContext('2d');

let wealthRatio = 0; // initial needle position

const data = {
      labels: [
        '<1 Bankrap!',
        '1-5 Kritikal',
        '6-10 Normal',
        '10-20 Sihat',
        '21-50 Cergas',
        '50-96 Athlete',
        '>96 Olympic Athlete',
        '>168 A Free MAN!'
      ],
      datasets: [{
        data: [1, 5, 5, 10, 30, 46, 72, 72], // relative widths
        backgroundColor: [
          '#ff0000', // Bankrap
          '#ff9900', // Kritikal
          '#cccc00', // Normal
          '#66cc00', // Sihat
          '#00cc66', // Cergas
          '#0099cc', // Athlete
          '#9933cc', // Olympic
          '#000000'  // Free Man
        ],
        borderWidth: 1,
        borderColor: '#fff'
      }]
    };

const options = {
  rotation: -90, // start angle
  circumference: 180, // half circle
  cutout: '70%', // inner radius
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  }
};

// Needle plugin
const gaugeNeedle = {
  id: 'gaugeNeedle',
  afterDatasetDraw(chart, args, opts) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    const xCoor = meta.data[0].x;
    const yCoor = meta.data[0].y;
    const outerRadius = meta.data[0].outerRadius;

    // Map wealthRatio (0–200 scale) to 0–180 degrees
    const maxValue = 200;
    const angle = Math.PI + (wealthRatio / maxValue) * Math.PI;

    // Needle endpoint
    const needleRadius = outerRadius * 0.9; 
    const needleX = xCoor + needleRadius * Math.cos(angle);
    const needleY = yCoor + needleRadius * Math.sin(angle);

    // Draw needle
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(xCoor, yCoor);
    ctx.lineTo(needleX, needleY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw center circle
    ctx.beginPath();
    ctx.arc(xCoor, yCoor, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.restore();
  }
};
    
// create chart
const wealthGauge = new Chart(ctx, {
  type: 'doughnut',
  data: data,
  options: options,
  plugins: [gaugeNeedle]
});

// sync with calculation result
function updateGaugeFromResult() {
  const ratioText = document.getElementById('wealthratio').innerText;
  const targetValue = parseFloat(ratioText) || 0; // <- keep this name consistent
  const maxValue = 200;

  // Clamp value
  const clampedTarget = Math.min(targetValue, maxValue);

  // Smooth animation
  let start = wealthRatio;
  let end = clampedTarget;
  let startTime = null;
  const duration = 800; // ms

  function animateNeedle(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    wealthRatio = start + (end - start) * progress;
    wealthGauge.update();

    if (progress < 1) {
      requestAnimationFrame(animateNeedle);
    }
  }

  requestAnimationFrame(animateNeedle);
}