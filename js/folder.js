export class Folder {
    // CREATE FOLDER
    createFolder(config, folderObject) {
        // VALUES
        this.type = 'folder';
        this.container = config.container;
        this.id = config.id;
        this.name = config.name;
        this.tasksFolder = config.tasksFolder;
        this.tasks = null;

        // VALUES HTML
        let folder = document.createElement('div');
        folder.id = this.id;
        folder.classList.add('folder');
        let folderName = document.createElement('p');
        folderName.innerHTML = this.name;
        folderName.id = 'folderName' + folder.id;
        let taskContainer = document.createElement('div');
        taskContainer.id = 'taskContainer' + this.id;
        taskContainer.classList.add('taskContainer');

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
            this.removeFolder(folderObject);
        });
    }

    // PUT IN A TASK
    taskIn(taskContainer, task) {
        task.fadeOut(function() {
            task.find(".task")
                .end()
                .appendTo(taskContainer)
                .fadeIn()
        });

        // GET ACTUAL TASKS
        (async () => {
            const rawResponse = await fetch('http://localhost:3000', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            const content = await rawResponse.json();
            this.tasks = content.tasks;

            this.tasksFolder.push(task[0].id);
            task.idFolder = this.id;
            
            let taskObject = this.tasks.find(tsk => tsk.id == task[0].id);
            taskObject.idFolder = this.id;
            this.tasks.splice(this.tasks.indexOf(taskObject.id), 1, taskObject);

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

                this.updatePosition($('#' + this.id).position());
            })();
        })();
    }

    // REMOVE FOLDER
    removeFolder(folderObject) {
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

            $('#' + this.id).remove();
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