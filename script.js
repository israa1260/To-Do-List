document.getElementById('add-btn').addEventListener('click', addTask);
document.getElementById('all-btn').addEventListener('click', () => filterTasks('all'));
document.getElementById('active-btn').addEventListener('click', () => filterTasks('active'));
document.getElementById('completed-btn').addEventListener('click', () => filterTasks('completed'));
document.getElementById('clear-completed-btn').addEventListener('click', clearCompleted);
document.getElementById('search-input').addEventListener('input', searchTasks);

window.addEventListener('load', loadTasks);

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
    const text = document.getElementById('new-task').value;
    const date = document.getElementById('task-date').value;
    const priority = document.getElementById('task-priority').value;

    if (text === '') return;

    const task = {
        id: Date.now(),
        text,
        completed: false,
        priority,
        date
    };

    tasks.push(task);
    saveTasks();
    renderTasks();

    document.getElementById('new-task').value = '';
    document.getElementById('task-date').value = '';
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
        task.text = newText;
        saveTasks();
        renderTasks();
    }
}

function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
}

function searchTasks() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const filtered = tasks.filter(t => t.text.toLowerCase().includes(keyword));
    renderTasks(filtered);
}

function filterTasks(filter) {
    let filtered = tasks;

    if (filter === 'active') filtered = tasks.filter(t => !t.completed);
    if (filter === 'completed') filtered = tasks.filter(t => t.completed);

    renderTasks(filtered);
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    renderTasks();
}

function renderTasks(list = tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    list.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });

    Sortable.create(taskList, {
        animation: 150,
        onEnd: updateTaskOrder
    });
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    li.className = task.completed ? 'completed' : '';

    li.innerHTML = `
        <span>${task.text}</span>

        <span class="priority-badge priority-${task.priority}">
            ${task.priority}
        </span>

        ${task.date ? `<span class="task-date">${task.date}</span>` : ''}

        <div>
            <button class="edit-btn">✏️</button>
            <button class="complete-btn">✔️</button>
            <button class="delete-btn">❌</button>
        </div>
    `;

    li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
    li.querySelector('.complete-btn').addEventListener('click', () => completeTask(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

    return li;
}

function updateTaskOrder() {
    const items = document.querySelectorAll('#task-list li');
    const newOrder = [];

    items.forEach(li => {
        const id = li.getAttribute('data-id');
        const task = tasks.find(t => t.id == id);
        if (task) newOrder.push(task);
    });

    tasks = newOrder;
    saveTasks();
}
