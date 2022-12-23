import {Config} from './config.js';
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
        
        // TASKS OUT FOLDER
        tasks.forEach(task => {
            if (task.idFolder == null) {
                addElementByObject('task', task);
            }
        });

        // FOLDERS
        folders.forEach(folder => {
            addElementByObject('folder', folder);
            // TASKS IN FOLDER
            if (folder.tasksFolder.length > 0) {
                folder.tasksFolder.forEach(task => {
                    let taskContainer = $('#' + folder.id).children("#taskContainer" + folder.id);
                    addElementByObject('task', task, taskContainer);
                });
            }
        });
    })();
});

// ADD ELEMENT BY OBJECT
function addElementByObject(type, object, taskContainer) {
    if (type == 'folder') {
        // CREATE FOLDER
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
let config = new Config();
config.init(folders);

$('#container').droppable({
    accept: '.task',
    drop: (event, ui) => {
        taskIn(ui.draggable);
    }
});

function taskIn(task) {
    folders.forEach(folder => {
        if (folder.tasksFolder.includes(task[0].id)) {
            task.fadeOut(function() {
                task
                    .find('.task')
                    .end()
                    .appendTo(container)
                    .fadeIn();
            });

            folder.tasksFolder.splice(task[0].id, 1);
            let taskObject = tasks.find(tsk => tsk.id == task[0].id);
            taskObject.idFolder = null;
            
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
                            'element': taskObject,
                            'parent': folder
                        }
                    )
                });
                const content = await rawResponse.json();
                console.log(content);
            })();
        }
    });
}

// CREATE FOLDER
$('#buttonCreateFolder').on('click', () => {
    if ($('#nameCreateFolder').val()) {
        // TO SERVER
        (async () => {
            let data = {
                'type': 'folder',
                'container': container.id,
                'name': $('#nameCreateFolder').val(),
                'tasksFolder': []
            }
            const rawResponse = await fetch('http://localhost:3000', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const content = await rawResponse.json();
            console.log(content);

            // FOLDER
            let element = content.element;
            let folder = new Folder();
            folder.createFolder({
                'container': element.container, 
                'id': element.id,
                'name': element.name,
                'tasksFolder': element.tasksFolder,
                'tasks': tasks
            }, folder);
            $('#' + folder.id).zIndex(999);
        })();
    } else alert('Enter a valid folder');
});

// CREATE TASK
$('#buttonCreateTask').on('click', () => {
    if ($('#titleCreateTask').val()) {
        let taskTitle = $('#titleCreateTask').val();
        let taskContent = $('#contentCreateTask').val();

        // TO SERVER
        (async () => {
            let data = {
                'type': 'task',
                'container': container.id,
                'title': taskTitle,
                'content': taskContent
            }
            const rawResponse = await fetch('http://localhost:3000', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const content = await rawResponse.json();
            console.log(content);

            // TASK
            let element = content.element;
            let task = new Task();
            task.createTask({
                'container': element.container,
                'id': element.id,
                'title': element.title,
                'content': element.content
            }, task);
        })();
    } else alert('Enter a valid task');
});