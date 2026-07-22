const addTask = document.getElementById('addTask');
const toDo = document.querySelector('.task-list[data-status="todo"]');
const doing = document.querySelector('.task-list[data-status="doing"]');
const done = document.querySelector('.task-list[data-status="done"]');

let draggedElement = null;


async function loadtasks(){
    const response = await fetch('/api/tasks');
    const tasks = await response.json();

    document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');

    tasks.forEach(task => {
        const article = document.createElement('article');
        article.classList.add('task-card');
        article.setAttribute('draggable', 'true')
        article.dataset.id = task.id;

        article.addEventListener('dragstart', () => {
            draggedElement = article;
            article.classList.add('dragging');
        });

        article.addEventListener('dragend', () => {
            draggedElement = null;
            article.classList.remove('dragging');
        });


        const span = document.createElement('span');
        span.innerText = `${task.status}`;
        span.classList.add('tag');

        const title = document.createElement('p');
        title.textContent = task.title;

        const btn = document.createElement('button');
        btn.innerText = '×';
        btn.classList.add('task-delete');
        btn.addEventListener('click',  async () => {
            await fetch(`/api/tasks/${task.id}`, {method: 'DELETE'})

            loadtasks();
        });

        article.appendChild(span);
        article.appendChild(title);
        article.appendChild(btn);

        if(task.status === 'todo'){
            toDo.appendChild(article);
        }else if(task.status === 'doing'){
            doing.appendChild(article);
        }else{
            done.appendChild(article);
        }
    });
}

document.querySelectorAll(".task-list").forEach(list => {
    list.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    list.addEventListener('dragenter', () => {
        list.classList.add('drag-over');
    });

    list.addEventListener('dragleave', () => {
        list.classList.remove('drag-over');
    });

    list.addEventListener('drop', async (e) => {
        e.preventDefault();
        list.classList.remove('drag-over');
        if(!draggedElement) return;

        const taskId = draggedElement.dataset.id;
        const newStatus = list.dataset.status;

        list.appendChild(draggedElement);
        const tag = draggedElement.querySelector('.tag');
        tag.innerText = newStatus;

        await fetch(`/api/tasks/${taskId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({status: newStatus})
        })
    });
});

addTask.addEventListener('submit', async (e) =>{
    e.preventDefault();

    const input = document.getElementById('add-task-input');
    const title = input.value;

    if (!title.trim()) return;

    await fetch('/api/tasks', {
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({title: title})
    });

    addTask.reset();
    loadtasks();
});

loadtasks();