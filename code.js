let editInput = document.querySelector("#taskInput");
let addBtn = document.querySelector("#addTaskBtn");
let tasksList = document.querySelector("#tasksList");
let filterBtns = document.querySelectorAll(".filter-btn");
let taskCounter = document.querySelector("#taskCounter");
let clearCompleted = document.querySelector("#clearCompleted");
let emptyState = document.querySelector(".empty-state");
let popUp = document.querySelector(".popup-display");
let undoRedo = document.querySelector(".undo-redo");
let priority = document.querySelector(".priority-dropdown");
const themeToggle = document.getElementById("themeToggle");
const featureBtn = document.querySelector("header");
const featuresList = document.querySelector(".features-list1");

// Features-List
featureBtn.addEventListener("click", (e) => {
  if (e.target.classList.contains("features-btn")) {
    featuresList.style.display = "block";
  } else if (
    e.target.classList.contains("confirm-overlay2") ||
    e.target.classList.contains("close-btn")
  ) {
    featuresList.style.display = "none";
  }
});

// Theme Selection
const isDarkMode = localStorage.getItem("theme") === "dark";
if (isDarkMode) {
  document.body.classList.add("dark-mode");
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  // Save the new preference
  const isNowDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isNowDark ? "dark" : "light");
});

// States
let tasksArray = [];
let idCounter = 1;
let currentFilter = "all";
let priorityFilter = "all";
let history = [];
let currentHistoryIndex = -1;

let historySaving = () => {
  history.push(structuredClone(tasksArray));
  currentHistoryIndex++;
};

let storageTasks = JSON.parse(localStorage.getItem("Tasks"));
if (storageTasks) {
  tasksArray = storageTasks;
  historySaving();
}

updateDisplay();
let setLocalStorage = () =>
  localStorage.setItem("Tasks", JSON.stringify(tasksArray));

filterBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    filterBtns.forEach((btn2) => {
      btn2.classList.remove("active");
      e.target.classList.add("active");
    });
    currentFilter = btn.dataset.filter;
    updateDisplay();
  });
});

priority.addEventListener("change", function () {
  priorityFilter = this.value;
  priority.classList.add("active");
  updateDisplay();
});

function updateDisplay() {
  updateUndoRedo();
  if (tasksArray.length === 0) {
    tasksList.innerHTML = `<div class="empty-state"><p>No tasks yet. Add one above! 📝</p></div>`;
    return;
  }
  let tasksToShow = tasksArray;
  if (currentFilter === "active") {
    tasksToShow = tasksArray.filter((task) => !task.completed);
  } else if (currentFilter === "completed") {
    tasksToShow = tasksArray.filter((task) => task.completed);
  }

  let conditionsCheck = (currentPriority) => {
    if (currentFilter == "active") {
      tasksToShow = tasksArray.filter(
        (task) => task.priority == currentPriority && !task.completed
      );
    } else if (currentFilter === "completed") {
      tasksToShow = tasksArray.filter(
        (task) => task.priority == currentPriority && task.completed
      );
    } else if (currentFilter === "all") {
      tasksToShow = tasksArray.filter(
        (task) => task.priority == currentPriority
      );
    }
  };

  if (priorityFilter == "Low") {
    conditionsCheck("low");
  } else if (priorityFilter == "Medium") {
    conditionsCheck("medium");
  } else if (priorityFilter == "High") {
    conditionsCheck("high");
  }

  let tasks = tasksToShow.map((element) => {
    let checkClass = `class="${element.completed ? "check" : ""}"`;
    let disabled = `${element.completed ? "disabled" : ""}`;
    let id = `${element.id}`;
    return `
    <div class="task-container" draggable="true">
    <div class="drag-handle" >≡</div>
    <div class="task ${element.completed ? "completed" : ""}" id="${id}">
    <div class="main-task">
<div class="task-text">${element.Text}</div>
<input type="checkbox" ${element.completed ? "checked" : ""}>
<button class="delete-btn">×</button>
</div>
     <div class="radio-btns">
            <div>
            <input type="radio" id="low${id}"  ${
      element.priority === "low" ? "checked" : ""
    } ${disabled} ${checkClass} value="low" name="priority${id}">
            <label for="low${id}" ${checkClass}>Low</label></div>
            <div>
            <input type="radio" id="medium${id}" ${
      element.priority === "medium" ? "checked" : ""
    } ${disabled} ${checkClass} value="medium" name="priority${id}">
            <label for="medium${id}" ${checkClass}>Medium</label></div>
            <div>
            <input type="radio" id="high${id}" ${
      element.priority === "high" ? "checked" : ""
    } ${disabled} ${checkClass} value="high" name="priority${id}">
            <label for="high${id}" ${checkClass}>High</label></div>
         </div>
</div>
</div>`;
  });
  tasksList.innerHTML = tasks.join(" ");
  editInput.value = "";

  idCounter = tasksArray[tasksArray.length - 1].id + 1;
  remainingTasks();
  updateUndoRedo();
}

function remainingTasks() {
  let tasksCount = tasksArray.filter((task) => task.completed == false);
  taskCounter.textContent = tasksCount.length;
}

addBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (editInput.value == "") {
    editInput.style.border = "2px solid red";
    editInput.placeholder = "Add Something!!!";
    return;
  }
  if (editInput.value.length > 0) {
    editInput.style.border = `2px solid #f0e2e2`;
    editInput.placeholder = "What needs to be done?";
  }
  let taskObject = {
    Text: editInput.value,
    id: Date.now(),
    completed: false,
    priority: "",
  };
  tasksArray.push(taskObject);
  setLocalStorage();
  historySaving();
  updateDisplay();
  remainingTasks();
});

tasksList.addEventListener("click", (e) => {
  const taskElement = e.target.closest(".task");
  if (!taskElement) return;
  const taskId = taskElement.id;
  const task = tasksArray.find((task) => task.id == taskId);
  if (e.target.id == `low${taskId}`) {
    task.priority = "low";
    setLocalStorage();
  } else if (e.target.id == `medium${taskId}`) {
    task.priority = "medium";
    setLocalStorage();
  } else if (e.target.id == `high${taskId}`) {
    task.priority = "high";
    setLocalStorage();
  }

  if (task.completed) {
    tasksList.removeEventListener("dblclick", editingInput);
  } else {
    tasksList.addEventListener("dblclick", editingInput);
  }

  if (e.target.type === "checkbox") {
    task.completed = !task.completed;
    setLocalStorage();
    historySaving();
    updateDisplay();
    remainingTasks();
  }
  if (e.target.classList.contains("delete-btn")) {
    popUp.style.display = "none";
    tasksArray = tasksArray.filter((task) => task.id != taskId);
    setLocalStorage();
    historySaving();
    updateDisplay();
    remainingTasks();
  }
});

clearCompleted.addEventListener("click", () => {
  tasksArray = tasksArray.filter((completedTask) => !completedTask.completed);
  setLocalStorage();
  updateDisplay();
});

//Extra Features>>>
function editingInput(e) {
  if (
    e.target.classList.contains("task-text") ||
    e.target.classList.contains("task")
  ) {
    const taskElement = e.target.closest(".task");
    const taskId = taskElement.id;
    const taskText = taskElement.querySelector(".task-text");
    taskText.style.display = "none";
    taskText.insertAdjacentHTML(
      "beforeBegin",
      `<input type="text" class="edit-task" value="${taskText.textContent}">`
    );
    let editInput = taskElement.querySelector(".edit-task");
    editInput.select();
    editInput.addEventListener("keydown", (e) => {
      let task = tasksArray.find((task) => task.id == taskId);
      if (e.key == "Enter") {
        if (task) task.Text = editInput.value;
        setLocalStorage();
        historySaving();
        updateDisplay();
        popUp.style.display = "none";
      } else if (e.key == "Escape") {
        editInput.remove();
        taskText.style.display = "block";
        popUp.style.display = "none";
      }
    });

    editInput.addEventListener("blur", () => {
      popUp.style.display = "none";
      let task = tasksArray.find((task) => task.id == taskId);
      taskText.style.display = "block";
      if (task.Text != editInput.value) {
        taskText.style.display = "none";
        popUp.style.display = "block";
      } else {
        popUp.style.display = "none";
        editInput.remove();
      }
    });
  }
}
tasksList.addEventListener("dblclick", editingInput);

popUp.addEventListener("click", (e) => {
  let editInput = document.querySelector(".edit-task");
  const taskElement = editInput.closest(".task");
  const taskId = taskElement.id;
  const taskText = taskElement.querySelector(".task-text");
  let task = tasksArray.find((task) => task.id == taskId);
  if (e.target.classList.contains("save-btn")) {
    if (task) task.Text = editInput.value;
    setLocalStorage();
    historySaving();
    updateDisplay();
    popUp.style.display = "none";
  } else if (e.target.classList.contains("cancel-btn")) {
    popUp.style.display = "none";
    taskText.style.display = "block";
    editInput.remove();
  }
});

// Dragging Feature

tasksList.addEventListener("dragstart", (e) => {
  // When dragging starts
  if (e.target.classList.contains("task-container")) {
    const taskElement = e.target
      .closest(".task-container")
      .querySelector(".task");
    e.dataTransfer.setData("text/plain", taskElement.id);
    taskElement.classList.remove("dragging");
    e.dataTransfer.setDragImage(taskElement, 70, 70);
  }
});

tasksList.addEventListener("dragover", (e) => {
  e.preventDefault();
  // Remove from ALL tasks first
  document.querySelectorAll(".drag-over").forEach((task) => {
    task.classList.remove("drag-over");
  });
  const taskElement = e.target.closest(".task-container");
  if (taskElement) {
    let task = taskElement.querySelector(".task");
    task.classList.add("drag-over");
  } else return;
});

tasksList.addEventListener("drop", (e) => {
  let draggedElement = e.dataTransfer.getData("text/plain");
  const taskElement = e.target
    .closest(".task-container")
    ?.querySelector(".task");
  if (!taskElement) return;
  taskElement.classList.add("dragging");
  const dragIndex = tasksArray.findIndex((task) => task.id == draggedElement);
  const targetIndex = tasksArray.findIndex((task) => task.id == taskElement.id);
  const [draggedTask] = tasksArray.splice(dragIndex, 1);
  tasksArray.splice(targetIndex, 0, draggedTask);
  setLocalStorage();
  historySaving();
  updateDisplay();
});
tasksList.addEventListener("dragend", () => {
  document.querySelectorAll(".drag-over").forEach((task) => {
    task.classList.remove("drag-over");
  });
});

//  Undo-Redo feature
undoRedo.addEventListener("click", (e) => {
  if (e.target.classList.contains("undo")) {
    if (currentHistoryIndex > 0) {
      currentHistoryIndex--;
      tasksArray = history[currentHistoryIndex];
      setLocalStorage();
      updateDisplay();
    }
  } else if (e.target.classList.contains("redo")) {
    if (currentHistoryIndex < history.length - 1) {
      currentHistoryIndex++;
      tasksArray = history[currentHistoryIndex];
      setLocalStorage();
      updateDisplay();
    }
  } else {
    return;
  }
});
function updateUndoRedo() {
  let redoBtn = document.querySelector(".redo");
  let undoBtn = document.querySelector(".undo");
  undoBtn.disabled = currentHistoryIndex <= 0;
  redoBtn.disabled = currentHistoryIndex >= history.length - 1;
  clearCompleted.disabled = tasksArray.every((task) => task.completed == false);
}