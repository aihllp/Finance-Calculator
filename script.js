function calculate() {
  const income = Number(document.getElementById("income").value) || 0;
  const expenses = Number(document.getElementById("expenses").value) || 0;
  const assets = Number(document.getElementById("assets").value) || 0;
  const liabilities = Number(document.getElementById("liabilities").value) || 0;

  const cashflow = income - expenses;
  const networth = assets - liabilities;
  const wealthratio = liabilities === 0 ? "∞" : (assets / liabilities).toFixed(2);

  document.getElementById("cashflow").textContent = cashflow;
  document.getElementById("networth").textContent = networth;
  document.getElementById("wealthratio").textContent = wealthratio;
}