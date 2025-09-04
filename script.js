function updateFullCalendar() {
  const today = new Date();
  const dayIndex = today.getDay();
  const month = today.getMonth();
  const year = today.getFullYear();
  const currentDate = today.getDate();

  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  document.getElementById("day").textContent = days[dayIndex];
  document.getElementById("date").textContent = currentDate;
  document.getElementById("monthYear").textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarBody = document.getElementById("calendar-body");
  calendarBody.innerHTML = "";

  let date = 1;
  for (let i = 0; i < 6; i++) {
    let row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        let cell = document.createElement("td");
        row.appendChild(cell);
      } else if (date > daysInMonth) {
        break;
      } else {
        let cell = document.createElement("td");
        cell.textContent = date;

        if (date === currentDate) {
          cell.classList.add("today");
        }

        row.appendChild(cell);
        date++;
      }
    }

    calendarBody.appendChild(row);
  }
}

updateFullCalendar();

setInterval(updateFullCalendar, 1000 * 60 * 60 * 24);
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let xp = Number(localStorage.getItem('xp')) || 0;
let xpLog = JSON.parse(localStorage.getItem('xpLog')) || {};

let chart = null;

function saveData() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('xp', xp.toString());
  localStorage.setItem('xpLog', JSON.stringify(xpLog));
}

function updateXPUI() {
  document.getElementById('xp').textContent = xp;
  document.getElementById('level').textContent = Math.floor(xp / 100);
  document.getElementById('progress-fill').style.width = `${xp % 100}%`;
}

function renderTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  tasks.forEach((task, index) => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';
    li.innerHTML = `
      ${task.title}
      <div>
        <button onclick="toggleComplete(${index})">${task.completed ? '↩️' : '✅'}</button>
        <button onclick="deleteTask(${index})">❌</button>
      </div>
    `;
    list.appendChild(li);
  });
}

function addTask() {
  const input = document.getElementById('task-input');
  const title = input.value.trim();
  if (title !== '') {
    tasks.push({ title, completed: false });
    input.value = '';
    saveData();
    renderTasks();
  }
}

function toggleComplete(index) {
  let task = tasks[index];
  task.completed = !task.completed;

  if (task.completed) {
    xp += 10;
    const today = new Date().toISOString().slice(0, 10);
    xpLog[today] = (xpLog[today] || 0) + 10;
  } else {
    xp -= 10;
    xp = Math.max(xp, 0); // prevent negative XP
  }

  saveData();
  updateXPUI();
  renderTasks();
  updateChart();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveData();
  renderTasks();
}

function clearAll() {
  if (confirm("Clear all tasks and reset XP?")) {
    tasks = [];
    xp = 0;
    xpLog = {};
    saveData();
    updateXPUI();
    renderTasks();
    updateChart();
  }
}

function updateChart() {
  const labels = [];
  const values = [];

  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    labels.push(key.slice(5)); // MM-DD
    values.push(xpLog[key] || 0);
  }

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = values;
    chart.update();
  }
}

function createChart() {
  const ctx = document.getElementById('xpChart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: 'XP per Day',
        data: [],
        backgroundColor: '#00796b',
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        }
      }
    }
  });
  updateChart();
}

// Initialize
updateXPUI();
renderTasks();
createChart();
