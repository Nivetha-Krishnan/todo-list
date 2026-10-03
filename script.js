const input = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const list = document.getElementById("task-list");
const empty = document.getElementById("empty");
const progressLabel = document.getElementById("progress-label");
const progressPercent = document.getElementById("progress-percent");
const barFill = document.getElementById("bar-fill");
const clearDone = document.getElementById("clear-done");
const filterButtons = document.querySelectorAll(".filter");
const today = document.getElementById("today");

const STORAGE_KEY = "todo-tasks";
let tasks = loadTasks();
let currentFilter = "all";

today.textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long", day: "numeric", month: "long"
});

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    /* storage unavailable, app still works for this session */
  }
}

function render() {
  list.innerHTML = "";

  const visible = tasks.filter(function (t) {
    if (currentFilter === "active") return !t.done;
    if (currentFilter === "completed") return t.done;
    return true;
  });

  visible.forEach(function (task) {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "check";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark complete: " + task.text);
    checkbox.addEventListener("change", function () {
      task.done = checkbox.checked;
      saveTasks();
      render();
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "Delete";
    del.setAttribute("aria-label", "Delete task: " + task.text);
    del.addEventListener("click", function () {
      tasks = tasks.filter(function (t) { return t.id !== task.id; });
      saveTasks();
      render();
    });

    li.append(checkbox, text, del);
    list.appendChild(li);
  });

  const total = tasks.length;
  const done = tasks.filter(function (t) { return t.done; }).length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  progressLabel.textContent = done + " of " + total + " done";
  progressPercent.textContent = percent + "%";
  barFill.style.width = percent + "%";
  clearDone.style.visibility = done ? "visible" : "hidden";

  const messages = {
    all: "No tasks yet. Add your first one above.",
    active: "No pending tasks. Nice work!",
    completed: "No completed tasks yet. Tick a task to see it here."
  };
  empty.textContent = messages[currentFilter];
  empty.style.display = visible.length ? "none" : "block";
}

function addTask() {
  const value = input.value.trim();
  if (!value) {
    input.focus();
    return;
  }
  tasks.push({ id: Date.now(), text: value, done: false });
  saveTasks();
  input.value = "";
  input.focus();
  render();
}

// Event listener 1: click on the Add task button
addBtn.addEventListener("click", addTask);

// Event listener 2: Enter key inside the input box
input.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    addTask();
  }
});

clearDone.addEventListener("click", function () {
  tasks = tasks.filter(function (t) { return !t.done; });
  saveTasks();
  render();
});

filterButtons.forEach(function (btn) {
  btn.addEventListener("click", function () {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(function (b) { b.classList.toggle("active", b === btn); });
    render();
  });
});

render();