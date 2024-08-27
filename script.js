// Event listeners
document.getElementById('add-btn').addEventListener('click', addTask);
document.getElementById('all-btn').addEventListener('click', () => filterTasks('all'));
document.getElementById('active-btn').addEventListener('click', () => filterTasks('active'));
document.getElementById('completed-btn').addEventListener('click', () => filterTasks('completed'));

// Load tasks from localStorage on page load
window.addEventListener('load', loadTasks);

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function addTask() {
    const taskText = document.getElementById('new-task').value;
    if (taskText === '') return;

    const task = {
        id: Date.now(),  // Unique ID for each task
        text: taskText,
        completed: false
    };

    tasks.push(task);
    saveTasks();
    renderTasks();

    // Clear input field
    document.getElementById('new-task').value = '';
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const taskText = prompt('Edit task:', task.text);
    if (taskText !== null && taskText !== '') {
        task.text = taskText;
        saveTasks();
        renderTasks();
    }
}

function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    saveTasks();
    renderTasks();
}

function filterTasks(filter) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        let shouldDisplay = false;
        switch (filter) {
            case 'all':
                shouldDisplay = true;
                break;
            case 'active':
                shouldDisplay = !task.completed;
                break;
            case 'completed':
                shouldDisplay = task.completed;
                break;
        }

        if (shouldDisplay) {
            const li = createTaskElement(task);
            taskList.appendChild(li);
        }
    });
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    renderTasks();
}

function renderTasks() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = createTaskElement(task);
        taskList.appendChild(li);
    });
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.innerHTML = `
        ${task.text}
        <div>
            <button class="edit-btn">edit✏️</button>
            <button class="complete-btn">completed✔️</button>
            <button class="delete-btn">delete❌</button>
        </div>
    `;
    li.className = task.completed ? 'completed' : '';

    li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
    li.querySelector('.complete-btn').addEventListener('click', () => completeTask(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

    return li;
}
window.addEventListener('load', () => {
    loadTasks();
    
    // Initialize SortableJS on the task list
    const taskList = document.getElementById('task-list');
    Sortable.create(taskList, {
        animation: 150,
        onEnd: updateTaskOrder // Update the task order when dragging ends
    });
});

function updateTaskOrder() {
    const taskList = document.getElementById('task-list');
    const updatedTasks = [];
    
    // Reorder the tasks array based on the new order in the DOM
    taskList.querySelectorAll('li').forEach((li, index) => {
        const taskId = li.getAttribute('data-id');
        const task = tasks.find(t => t.id == taskId);
        if (task) {
            updatedTasks.push(task);
        }
    });
    
    tasks = updatedTasks;
    saveTasks();
}

// Ensure each task has a data-id attribute
function createTaskElement(task) {
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id); // Add a data-id attribute for identification
    li.innerHTML = `
        ${task.text}
        <div>
            <button class="edit-btn">edit✏️</button>
            <button class="complete-btn">completed✔️</button>
            <button class="delete-btn">delete❌</button>
           
        </div>
       
    `;
    li.className = task.completed ? 'completed' : '';

    li.querySelector('.edit-btn').addEventListener('click', () => editTask(task.id));
    li.querySelector('.complete-btn').addEventListener('click', () => completeTask(task.id));
    li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
   

    return li;
}


Sortable.create(taskList, {
    animation: 150,
    onEnd: updateTaskOrder,
    onStart: function(evt) {
        evt.item.classList.add('dragging');
    },
    onEnd: function(evt) {
        evt.item.classList.remove('dragging');
        updateTaskOrder();
    }
});
