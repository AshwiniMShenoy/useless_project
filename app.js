let tasks = [];
let voices = [];

window.speechSynthesis.onvoiceschanged = () => {
  voices = speechSynthesis.getVoices();
  console.log("Voices loaded:", voices.map(v => v.name));
};


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
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = voices.find(v => v.name === "Google Deutsch");

  if (voice) {
    utterance.voice = voice;
  }
  utterance.pitch = 0.4;   // 👈 Deep tone (lower = more evil)
  utterance.rate = 0.7;    // 👈 Slower = more dramatic
  utterance.volume = 1.0;  // 👈 Optional — loud and clear
  speechSynthesis.speak(utterance);
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

// ==========================
// 🎮 GAME ZONE
// ==========================

function toggleGame(gameId) {
  const gameDiv = document.getElementById(gameId);
  if (gameDiv.style.display === "block") {
    gameDiv.style.display = "none";
    gameDiv.innerHTML = "";
  } else {
    gameDiv.style.display = "block";
    loadGame(gameId, gameDiv);
  }
}

function loadGame(id, container) {
  if (id === "ticTacToe") {
    container.innerHTML = generateTicTacToe();
  } else if (id === "typingSpeed") {
    container.innerHTML = generateTypingGame();
  }
}

// 🟩 TIC TAC TOE
let board = ["", "", "", "", "", "", "", "", ""];
let gameOver = false;
let userWins = 0;
let botWins = 0;

function generateTicTacToe() {
  board = ["", "", "", "", "", "", "", "", ""];
  gameOver = false;

  return `
    <table id="ticBoard" style="margin:auto;border-collapse:collapse;">
      ${[0, 1, 2].map(row => `
        <tr>
          ${[0, 1, 2].map(col => {
            const index = row * 3 + col;
            return `<td id="cell${index}" onclick="playerMove(${index})" 
                    style="width:40px;height:40px;border:1px solid white;text-align:center;font-size:1.2rem;"></td>`;
          }).join("")}
        </tr>`).join("")}
    </table>
    <p id="turnInfo" style="text-align:center;">You: X &nbsp;&nbsp; Bot: O</p>
    <p style="text-align:center;">🏆 Wins — You: <span id="userWins">${userWins}</span> | Bot: <span id="botWins">${botWins}</span></p>
    <div style="text-align:center;"><button onclick="loadGame('ticTacToe', document.getElementById('ticTacToe'))">🔁 Restart</button></div>
  `;
}

function playerMove(index) {
  if (gameOver || board[index] !== "") return;

  board[index] = "X";
  updateBoard();

  if (checkWinner("X")) {
    gameOver = true;
    userWins++;
    updateScore();
    document.getElementById("turnInfo").innerText = "🎉 You win!";
    return;
  }

  if (isDraw()) {
    document.getElementById("turnInfo").innerText = "😐 It's a draw.";
    gameOver = true;
    return;
  }

  setTimeout(botMove, 500);
}

function botMove() {
  if (gameOver) return;

  // 1. Try to win
  let move = findBestMove("O");
  // 2. Try to block
  if (move === -1) move = findBestMove("X");
  // 3. Pick random
  if (move === -1) {
    const empty = board.map((v, i) => v === "" ? i : null).filter(i => i !== null);
    move = empty[Math.floor(Math.random() * empty.length)];
  }

  board[move] = "O";
  updateBoard();

  if (checkWinner("O")) {
    gameOver = true;
    botWins++;
    updateScore();
    document.getElementById("turnInfo").innerText = "😈 Bot wins!";
    return;
  }

  if (isDraw()) {
    document.getElementById("turnInfo").innerText = "😐 It's a draw.";
    gameOver = true;
  }
}

function findBestMove(player) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    const values = [board[a], board[b], board[c]];
    if (values.filter(v => v === player).length === 2 && values.includes("")) {
      const emptyIndex = pattern[values.indexOf("")];
      return emptyIndex;
    }
  }

  return -1;
}

function updateBoard() {
  board.forEach((val, i) => {
    const cell = document.getElementById("cell" + i);
    if (cell) cell.innerText = val;
  });
}

function checkWinner(player) {
  const winPatterns = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];

  return winPatterns.some(pattern => pattern.every(i => board[i] === player));
}

function isDraw() {
  return board.every(cell => cell !== "") && !checkWinner("X") && !checkWinner("O");
}

function updateScore() {
  document.getElementById("userWins").textContent = userWins;
  document.getElementById("botWins").textContent = botWins;
}


// ⌨️ TYPING SPEED GAME
// Global variables for timing
let typingStart = null;
let typingExpected = "";

let typingStartTime = null;
let typingSentence = "";

// 👇 Call this in loadGame
function generateTypingGame() {
    const sentences = [
      "The keyboard fears your laziness.",
      "Focus is overrated. Let's just play.",
      "You better type fast. Your future depends on it.",
      "Procrastination is an art, and you're an artist.",
      "Typing tests are the adult version of hide and seek."
    ];
  
    typingSentence = sentences[Math.floor(Math.random() * sentences.length)];
    typingStartTime = null;
  
    setTimeout(() => {
      const input = document.getElementById("typingInput");
      const display = document.getElementById("sentenceDisplay");
      const result = document.getElementById("typingResult");
      input.focus();
  
      input.addEventListener("input", function () {
        const userInput = this.value;
  
        if (!typingStartTime && userInput.length > 0) {
          typingStartTime = performance.now();
        }
  
        // Highlight each letter
        let highlighted = "";
        for (let i = 0; i < typingSentence.length; i++) {
          const userChar = userInput[i];
          const correctChar = typingSentence[i];
  
          if (userChar == null) {
            highlighted += `<span>${correctChar}</span>`;
          } else if (userChar === correctChar) {
            highlighted += `<span style="color:lightgreen">${correctChar}</span>`;
          } else {
            highlighted += `<span style="color:red">${correctChar}</span>`;
          }
        }
        display.innerHTML = highlighted;
  
        // End condition
        if (userInput === typingSentence) {
          const duration = (performance.now() - typingStartTime) / 1000;
          const wpm = Math.round(typingSentence.split(" ").length / (duration / 60));
          result.textContent = `👏 Done in ${duration.toFixed(2)}s — ${wpm} WPM. Not bad.`;
        } else {
          result.textContent = "Keep typing, mortal...";
        }
      });
    }, 0);
  
    return `
      <p id="sentenceDisplay">${typingSentence}</p>
      <input type="text" id="typingInput" placeholder="Start typing..." />
      <p id="typingResult"></p>
      <div style="text-align:center; margin-top:10px;">
      <button onclick="loadGame('typingSpeed', document.getElementById('typingSpeed'))">🔁 Restart</button>
      </div>
    `;
  }
  
