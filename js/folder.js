export class Folder {
    // CREATE FOLDER
    createFolder(config, folderObject) {
        // VALUES
        this.type = 'folder';
        this.container = config.container;
        this.id = config.id;
        this.name = config.name;
        this.tasksFolder = config.tasksFolder;
        let folders = config.folders;
        let tasks = config.tasks;

        // VALUES HTML
        let folder = document.createElement('div');
        folder.id = this.id;
        folder.classList.add('folder');
        let folderName = document.createElement('p');
        folderName.innerHTML = this.name;
        folderName.id = 'folderName' + folder.id;
        let taskContainer = document.createElement('div');
        this.taskContainer = taskContainer.id;
        taskContainer.id = 'taskContainer';

        if (config.position && (config.position.top && config.position.left)) {
            this.x = config.position.left;
            this.y = config.position.top;
            folder.style.left = this.x + 'px';
            folder.style.top = this.y + 'px';
        }
    
        // APPEND
        folder.append(folderName);
        folder.append(taskContainer);
        $('#' + this.container).append(folder);

        // JQUERY EVENTS
        this.setJQueryEvents(taskContainer, folder);
    
        // REMOVE
        let remover = document.createElement('div');
        remover.id = folder.id + 'Remover';
        remover.classList.add('removeFolder');
        folder.append(remover);
        $('#' + remover.id).on('click', () => {
            this.removeFolder(folders, tasks, folder, folderObject);
        });
    }

    // PUT IN A TASK
    taskIn(taskContainer, task) {
        task.idFolder = this.id;
        this.tasksFolder.push(task[0].id);
        task.fadeOut(function() {
            task.find(".task")
                .end()
                .appendTo(taskContainer)
                .fadeIn()
        });

        // TO SERVER
        (async () => {
            const rawResponse = await fetch('http://localhost:3000', {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({'element': this})
            });
            const content = await rawResponse.json();
            console.log(content);
        })();

        this.updatePosition($('#' + this.id).position());
    }

    // REMOVE FOLDER
    removeFolder(folders, tasks, folder, folderObject) {
        // TO SERVER
        (async () => {
            const rawResponse = await fetch('http://localhost:3000', {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(folderObject)
            });
            const content = await rawResponse.json();
            console.log(content);

            folders = content.folders;
            tasks = content.tasks;

            folders.splice(folder, 1);
            this.tasksFolder.forEach(task => {
                task = $('#' + task);
                if (task.parent().parent()[0] == $('#' + folder.id)[0]) {
                    this.tasksFolder.splice(this.tasksFolder.indexOf(task.id, 1));
                    tasks.splice(tasks.indexOf(task, 1));

                    // TO SERVER
                    (async () => {
                        await fetch('http://localhost:3000/tasks', {
                            method: 'DELETE',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({'tasks': tasks})
                        });
                    })();
                }
            });
            
            folder.remove();
            window.location.reload();
        })();
    }

    // JQUERY EVENTS
    setJQueryEvents(taskContainer, folder) {
        // DRAGGABLE
        $('#' + folder.id).draggable({
            containment: 'parent',
            stack: 'div',
            stop: (e, ui) => {
                this.updatePosition($('#' + this.id).position());
            }
        }).css('position', 'absolute');
    
        // DROPPABLE
        $('#' + folder.id).droppable({
            accept: '.task',
            drop: (event, ui) => {
                this.taskIn(taskContainer, ui.draggable);
            }
        });
    
        // RESIZABLE
        $('#' + folder.id).resizable({
            maxWidth: $('#' + this.container.id).width() - 23,
            resize : function(e) {
                let folder = $(e.target);
                folder.css('height', 'fit-content');
            }
        });
    }

    // UPDATE POSITION
    async updatePosition(position){
        const rawResponse = await fetch('http://localhost:3000/updatePosition', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(
                {
                    'type': 'folder',
                    'id': this.id,
                    'position': {
                        'top': position.top,
                        'left': position.left
                    }
                }
            )
        });
        const content = await rawResponse.json();
        console.log(content);
    }
}