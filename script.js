// Event Listeners
document.getElementById('add-btn').addEventListener('click', addTask);
document.getElementById('new-task').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
document.getElementById('task-description').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) addTask();
});
document.getElementById('all-btn').addEventListener('click', () => filterTasks('all'));
document.getElementById('active-btn').addEventListener('click', () => filterTasks('active'));
document.getElementById('completed-btn').addEventListener('click', () => filterTasks('completed'));
document.getElementById('clear-completed-btn').addEventListener('click', clearCompleted);
document.getElementById('search-input').addEventListener('input', searchTasks);
document.getElementById('sort-select').addEventListener('change', applySorting);
document.getElementById('dark-mode-toggle').addEventListener('click', toggleDarkMode);

window.addEventListener('load', () => {
    loadDarkMode();
    loadTasks();
});

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentSort = 'date';

// Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    document.getElementById('dark-mode-toggle').textContent = isDark ? '☀️' : '🌙';
}

function loadDarkMode() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-toggle').textContent = '☀️';
    }
}

// Task Management
function addTask() {
    const text = document.getElementById('new-task').value.trim();
    const date = document.getElementById('task-date').value;
    const priority = document.getElementById('task-priority').value;
    const category = document.getElementById('task-category').value.trim();
    const description = document.getElementById('task-description').value.trim();

    if (text === '') return;

    const task = {
        id: Date.now(),
        text,
        completed: false,
        priority,
        date,
        category: category || 'Uncategorized',
        description: description || ''
    };

    tasks.push(task);
    saveTasks();
    renderTasks();
    updateStatistics();

    // Clear inputs
    document.getElementById('new-task').value = '';
    document.getElementById('task-date').value = '';
    document.getElementById('task-category').value = '';
    document.getElementById('task-description').value = '';
    document.getElementById('new-task').focus();
}

function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Edit task:', task.text);
    if (newText !== null && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
        renderTasks();
        updateStatistics();
    }
}

function editTaskFull(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newText = prompt('Edit task name:', task.text) || task.text;
    const newCategory = prompt('Edit category:', task.category) || 'Uncategorized';
    const newDescription = prompt('Edit description:', task.description) || '';
    const newPriority = prompt('Edit priority (Low/Medium/High):', task.priority) || task.priority;
    const newDate = prompt('Edit date (YYYY-MM-DD):', task.date) || task.date;

    if (newText.trim() !== '') {
        task.text = newText.trim();
        task.category = newCategory.trim();
        task.description = newDescription.trim();
        task.priority = ['Low', 'Medium', 'High'].includes(newPriority) ? newPriority : task.priority;
        task.date = newDate;
        saveTasks();
        renderTasks();
        updateStatistics();
    }
}

function completeTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateStatistics();
    }
}

function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStatistics();
}

function clearCompleted() {
    if (!confirm('Are you sure you want to clear all completed tasks?')) return;
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
    updateStatistics();
}

// Search and Filter
function searchTasks() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    let filtered = tasks;

    if (keyword) {
        filtered = tasks.filter(t => 
            t.text.toLowerCase().includes(keyword) ||
            (t.category && t.category.toLowerCase().includes(keyword)) ||
            (t.description && t.description.toLowerCase().includes(keyword))
        );
    }

    applyFilterAndSort(filtered);
}

function filterTasks(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${filter}-btn`).classList.add('active');

    let filtered = tasks;
    if (filter === 'active') filtered = tasks.filter(t => !t.completed);
    if (filter === 'completed') filtered = tasks.filter(t => t.completed);

    applyFilterAndSort(filtered);
}

// Sorting
function applySorting() {
    currentSort = document.getElementById('sort-select').value;
    applyFilterAndSort();
}

function applyFilterAndSort(list = null) {
    let filtered = list !== null ? list : tasks;

    // Apply current filter if no list provided
    if (list === null) {
        if (currentFilter === 'active') filtered = tasks.filter(t => !t.completed);
        else if (currentFilter === 'completed') filtered = tasks.filter(t => t.completed);
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
        switch (currentSort) {
            case 'priority':
                const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            case 'name':
                return a.text.localeCompare(b.text);
            case 'category':
                return (a.category || 'Uncategorized').localeCompare(b.category || 'Uncategorized');
            case 'date':
            default:
                if (!a.date && !b.date) return 0;
                if (!a.date) return 1;
                if (!b.date) return -1;
                return new Date(a.date) - new Date(b.date);
        }
    });

    renderTasks(filtered);
}

// Statistics
function updateStatistics() {
    const total = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;

    document.getElementById('total-count').textContent = total;
    document.getElementById('active-count').textContent = active;
    document.getElementById('completed-count').textContent = completed;
}

// Storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    // Migrate old tasks without category/description
    tasks = tasks.map(task => ({
        ...task,
        category: task.category || 'Uncategorized',
        description: task.description || ''
    }));
    saveTasks();
    applyFilterAndSort();
    updateStatistics();
}

// Rendering
function renderTasks(list = tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    if (list.length === 0) {
        taskList.innerHTML = '<li class="empty-message">No tasks found</li>';
        return;
    }

    list.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });

    Sortable.create(taskList, {
        animation: 150,
        onEnd: updateTaskOrder,
        filter: '.empty-message'
    });
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    li.className = task.completed ? 'completed' : '';
    
    // Check if overdue
    const isOverdue = task.date && !task.completed && new Date(task.date) < new Date() && new Date(task.date).toDateString() !== new Date().toDateString();
    if (isOverdue) li.classList.add('overdue');

    // Format date
    let dateDisplay = '';
    if (task.date) {
        const taskDate = new Date(task.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDateOnly = new Date(taskDate);
        taskDateOnly.setHours(0, 0, 0, 0);
        
        if (taskDateOnly.getTime() === today.getTime()) {
            dateDisplay = '<span class="task-date today">Today</span>';
        } else if (taskDateOnly.getTime() === today.getTime() + 86400000) {
            dateDisplay = '<span class="task-date tomorrow">Tomorrow</span>';
        } else {
            const formattedDate = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: taskDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
            dateDisplay = `<span class="task-date ${isOverdue ? 'overdue-date' : ''}">${formattedDate}</span>`;
        }
    }

    const categoryDisplay = task.category && task.category !== 'Uncategorized' 
        ? `<span class="category-badge">${task.category}</span>` 
        : '';
    
    const descriptionDisplay = task.description 
        ? `<div class="task-description-display">${task.description}</div>` 
        : '';

    li.innerHTML = `
        <div class="task-content">
            <div class="task-main">
                <span class="task-text">${task.text}</span>
                ${categoryDisplay}
                <span class="priority-badge priority-${task.priority}">${task.priority}</span>
            </div>
            ${descriptionDisplay}
            <div class="task-meta">
                ${dateDisplay}
            </div>
        </div>
        <div class="task-actions">
            <button class="edit-full-btn" title="Edit full details">✏️</button>
            <button class="edit-btn" title="Edit name">📝</button>
            <button class="complete-btn" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">${task.completed ? '↩️' : '✔️'}</button>
            <button class="delete-btn" title="Delete">❌</button>
        </div>
    `;

    li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
    li.querySelector('.edit-full-btn').addEventListener('click', () => editTaskFull(task.id));
    li.querySelector('.complete-btn').addEventListener('click', () => completeTask(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

    return li;
}

function updateTaskOrder() {
    const items = document.querySelectorAll('#task-list li:not(.empty-message)');
    const newOrder = [];

    items.forEach(li => {
        const id = parseInt(li.getAttribute('data-id'));
        const task = tasks.find(t => t.id === id);
        if (task) newOrder.push(task);
    });

    tasks = newOrder;
    saveTasks();
}
