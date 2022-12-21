import {Folder} from './folder.js';
import {Task} from './task.js';

let container = $('#container');
container.id = 'container';

var folders = [];
var tasks = [];

$(window).on('beforeunload', () =>{
    folders.forEach(folder => {
        let domFolder = $(`#${folder.id}`);
        folder.updatePosition(domFolder.position());
    });
});

// ONLOAD GET DATA
$(window).on('load', () => {
    (async () => {
        const rawResponse = await fetch('http://localhost:3000', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const content = await rawResponse.json();
        console.log(content);

        folders = content.folders;
        tasks = content.tasks;
        
        tasks.forEach(task => {
            if (folders.length > 0) {
                folders.forEach(folder => {
                    if (!folder.tasksFolder.includes(task.id)) {
                        addElementByObject('task', task);
                    }
                });
            } else {
                addElementByObject('task', task);
            }
        });

        folders.forEach(folder => {
            addElementByObject('folder', folder);
            if (folder.tasksFolder.length > 0) {
                folder.tasksFolder.forEach(task => {
                    addElementByObject('task', task, taskContainer);
                });
            }
        });
    })();
});

// ADD ELEMENT BY OBJECT
function addElementByObject(type, object, taskContainer) {
    if (type == 'folder') {
        // CREATE
        let folder = new Folder(object);
        folder.createFolder(object, folder);
    }
    if (type == 'task' && !taskContainer) {
        // CREATE TASK
        let task = new Task();
        task.createTask(object, task);
    } else if (type == 'task' && taskContainer) {
        // ADD TASKS TO FOLDER
        let realTask = tasks.find(task => object == task.id);
        let taskClass = new Task();
        taskClass.createTask(realTask, realTask, taskContainer);
    }
}

// CONTAINER CONFIG
$('#container').droppable({
    accept: '.task',
    drop: function(event, ui) {
        elementIn(ui.draggable);
    }
});
function elementIn(element) {
    if (!element.hasClass('folder')) {
        let parent = null;
        folders.forEach(folder => {
            if (folder.tasksFolder.includes(element[0].id)) {
                parent = folder;
                folder.tasksFolder.splice(element[0].id, 1);
            }
        });

        element.fadeOut(function() {
            element
                .find('.task')
                .end()
                .appendTo(container)
                .fadeIn();
        });

        let elementObject = tasks.find(task => task.id == element[0].id);

        // TO SERVER
        (async () => {
            const rawResponse = await fetch('http://localhost:3000', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(
                    {
                        'element': elementObject,
                        'parent': parent
                    })
            });
            const content = await rawResponse.json();
            console.log(content);
        })();
    }
}

// CREATE FOLDER
$('#buttonCreateFolder').on('click', () => {
    if ($('#nameCreateFolder').val()) {
        let folder = new Folder();
        folder.createFolder({
            'container': container.id, 
            'id': 'folder' + folders.length,
            'name': $('#nameCreateFolder').val(),
            'tasksFolder': [],
            'folders': folders,
            'tasks': tasks
        }, folder);
        
        // JSON
        folders.push(folder);
        
        // TO SERVER
        (async () => {
            const rawResponse = await fetch('http://localhost:3000', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(folder)
            });
            const content = await rawResponse.json();
            console.log(content);
        })();
    } else alert('Enter a valid folder');
});

// CREATE TASK
$('#buttonCreateTask').on('click', () => {
    if ($('#titleCreateTask').val()) {
        let taskTitle = $('#titleCreateTask').val();
        let taskContent = $('#contentCreateTask').val();
        
        let task = new Task();
        task.createTask({
            'container': container.id,
            'id': 'task' + tasks.length,
            'title': taskTitle,
            'content': taskContent,
            'folders': folders,
            'tasks': tasks
        }, task);

        // JSON
        tasks.push(task);

        // TO SERVER
        (async () => {
            const rawResponse = await fetch('http://localhost:3000', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(task)
            });
            const content = await rawResponse.json();
            console.log(content);
        })();
    } else alert('Enter a valid task');
});