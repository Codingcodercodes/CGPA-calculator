let semesterCount = 0;
let chart = null;

function addSemester() {
  semesterCount++;
  const container = document.getElementById('semesters');
  const inputGroup = document.createElement('div');
  inputGroup.className = 'input-group new';
  inputGroup.innerHTML = `
    <label for="sgpa${semesterCount}">Sem ${semesterCount} SGPA:</label>
    <input id="sgpa${semesterCount}">
  `;
  container.appendChild(inputGroup);
  updateInputType();
}

function updateInputType() {
  const system = document.getElementById("gradingScale").value;
  const inputs = document.querySelectorAll('#semesters input');
  let placeholder = 'e.g. 8.0';
  let type = 'number';
  let min = 0, max = 10, step = 0.01;

  switch (system) {
    case 'india': placeholder = 'e.g. 8.0'; max = 10; break;
    case 'usa': placeholder = 'e.g. 4.0'; max = 4; break;
    case 'canada': placeholder = 'e.g. 4.3'; max = 4.3; break;
    case 'uk': placeholder = 'e.g. 75'; max = 100; break;
    case 'ects': placeholder = 'e.g. A, B, C'; type = 'text'; break;
  }

  inputs.forEach(input => {
    input.placeholder = placeholder;
    input.type = type;
    if (type === 'number') {
      input.min = min;
      input.max = max;
      input.step = step;
    } else {
      input.removeAttribute('min');
      input.removeAttribute('max');
      input.removeAttribute('step');
    }
  });
}

function calculateCGPA() {
  let total = 0, count = 0;
  let sgpaValues = [];
  const grading = document.getElementById("gradingScale").value;
  const resultDiv = document.getElementById('result');
  const quote = document.getElementById('quote');
  const explanation = document.getElementById('explanation');
  const chartCanvas = document.getElementById('progressChart');
  let maxValue = 10;

  switch (grading) {
    case 'india': maxValue = 10; break;
    case 'usa': maxValue = 4.0; break;
    case 'canada': maxValue = 4.3; break;
    case 'uk': maxValue = 100; break;
    case 'ects': maxValue = 5; break;
  }

  let inputs = document.querySelectorAll('#semesters input');
  inputs.forEach(i => i.style.border = '');

  for (let i = 1; i <= semesterCount; i++) {
    const input = document.getElementById(`sgpa${i}`);
    const val = input.value.trim();
    if (val) {
      if (grading === 'ects') {
        total++;
        count++;
        continue;
      }
      const num = parseFloat(val);
      if (!isNaN(num)) {
        if (num > maxValue) {
          input.style.border = '2px solid red';
          showModal(`Semester ${i}: "${num}" exceeds max value (${maxValue}).`);
          chartCanvas.style.display = 'none';
          return;
        }
        sgpaValues.push(num);
        total += num;
        count++;
      }
    }
  }

  if (count === 0) {
    resultDiv.innerText = 'Please enter at least one SGPA.';
    explanation.style.display = 'none';
    quote.style.display = 'none';
    chartCanvas.style.display = 'none';
    return;
  }

  const cgpa = (total / count).toFixed(2);
  let percentage = '';
  switch (grading) {
    case 'india': percentage = (cgpa * 9.5).toFixed(2); break;
    case 'usa': percentage = ((cgpa / 4.0) * 100).toFixed(2); break;
    case 'canada': percentage = ((cgpa / 4.3) * 100).toFixed(2); break;
    case 'uk': percentage = cgpa; break;
    case 'ects': percentage = 'N/A'; break;
  }

  resultDiv.innerText = `Your CGPA is ${cgpa}\nEquivalent Percentage: ${percentage}${grading === 'ects' ? '' : '%'}`;
  explanation.style.display = 'block';
  quote.style.display = 'block';
  quote.innerHTML = `<span style="color: var(--accent); font-weight: bold;">${cgpa}</span> – Keep striving, you're doing amazing!`;

  if (grading !== 'ects') {
    drawChart(sgpaValues, maxValue);
  } else {
    chartCanvas.style.display = 'none';
  }
}

function drawChart(data, maxY) {
  const ctx = document.getElementById('progressChart').getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, '#a87ff3');
  gradient.addColorStop(1, '#e0c3fc');

  const labels = data.map((_, i) => `Sem ${i + 1}`);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'SGPA Progress',
        data,
        borderColor: gradient,
        backgroundColor: 'rgba(160, 100, 250, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#6a0dad',
        pointRadius: 5,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: maxY,
          ticks: { color: getComputedStyle(document.body).getPropertyValue('--text') }
        },
        x: {
          ticks: { color: getComputedStyle(document.body).getPropertyValue('--text') }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: getComputedStyle(document.body).getPropertyValue('--text')
          }
        }
      }
    }
  });

  document.getElementById('progressChart').style.display = 'block';
}

function changeTheme() {
  const theme = document.getElementById("themeSwitch").value;
  document.body.className = theme;
}

function showModal(message) {
  document.getElementById("errorMessage").textContent = message;
  document.getElementById("errorModal").style.display = 'flex';
}

function closeModal() {
  document.getElementById("errorModal").style.display = 'none';
}
