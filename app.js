let tasks = [];

function addTask() {
  const input = document.getElementById("taskInput");
  const color = document.getElementById("colorPicker").value;
  const tag = document.getElementById("tagPicker").value;
  const text = input.value.trim();

  if (text === "") return;

  const task = {
    id: Date.now(),
    text,
    color,
    tag,
    pinned: false
  };

  tasks.push(task);
  input.value = "";
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  const sorted = [...tasks].sort((a, b) => b.pinned - a.pinned);

  sorted.forEach((task) => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.style.borderLeft = `5px solid ${task.color || "#555"}`;

    card.innerHTML = `
      <div class="content">${task.text}</div>
      <div class="tag">${task.tag || "No Tag"}</div>
      <div class="actions">
        <button onclick="pinTask(${task.id})">📌</button>
        <button onclick="editTask(${task.id})">✏️</button>
        <button onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    `;

    list.appendChild(card);
  });
}

function pinTask(id) {
  const task = tasks.find(t => t.id === id);
  task.pinned = !task.pinned;
  speak(`Oh wow. You pinned "${task.text}". So ambitious.`);
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(t => t.id === id);
  const newText = prompt("Edit your empty dreams:", task.text);
  if (newText) {
    task.text = newText;
    speak(`You changed it? As if that helps...`);
    renderTasks();
  }
}

function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  speak(`Deleting "${task.text}"? Classic.`);
  tasks = tasks.filter(t => t.id !== id);
  renderTasks();
}

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.pitch = 0.7;
  msg.rate = 0.85;
  speechSynthesis.speak(msg);
}

function suggestTask() {
  const ideas = [
    "Stare at the ceiling for 20 minutes",
    "Add a useless checkbox",
    "Rewrite your resume for the 50th time",
    "Try to remember what productivity feels like",
    "Start 3 side projects and finish none"
  ];

  const idea = ideas[Math.floor(Math.random() * ideas.length)];
  document.getElementById("taskInput").value = idea;
  speak(`Here's a great idea: ${idea}`);
}
