let tasks = [];

function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();

  if (text === "") return;

  const task = {
    id: Date.now(),
    text,
    createdAt: Date.now(),
    mocked: false
  };

  tasks.push(task);
  input.value = "";
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>${task.text}</span>
      <button onclick="completeTask(${task.id})">✔</button>
    `;

    list.appendChild(li);

    if (!task.mocked) {
      task.mocked = true;
      setTimeout(() => mockUser(task.text), 20000);
    }
  });
}

function completeTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  speakEvil("Congratulations. You did one thing right.");
  renderTasks();
}

function mockUser(taskText) {
  speakEvil(`Still haven't done "${taskText}"? Pathetic.`);
}

function speakEvil(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = 0.7;
  utterance.rate = 0.85;
  utterance.volume = 1;
  utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes("Fred") || v.name.includes("Daniel") || v.lang.includes("en"));
  speechSynthesis.speak(utterance);
}
