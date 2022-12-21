export class Task {
    // CREATE TASK
    createTask(config, taskObject, taskContainer) {
        // VALUES
        this.type = 'task';
        this.container = config.container;
        this.id = config.id;
        this.title = config.title;
        this.content = config.content;
        let folders = config.folders;
        let tasks = config.tasks;

        // VALUES HTML
        let task = document.createElement('div');
        task.id = this.id;
        task.classList.add('task');
        let titleTask = document.createElement('h4');
        let contentTask = document.createElement('p');
        contentTask.id = task.id + 'p';
        titleTask.textContent = this.title;
        contentTask.textContent = this.content;
        
        // APPEND
        task.append(titleTask);
        task.append(contentTask);
        $('#' + this.container).append(task);

        if (taskContainer) {
            $('#' + task.id).appendTo(taskContainer);
        }

        // JQUERY EVENTS
        this.setJQueryEvents(task, contentTask);
    
        // REMOVE
        let remove = document.createElement('div');
        remove.id = task.id + 'Remover';
        remove.classList.add('removeTask');
        task.append(remove);
        $('#' + remove.id).on('click', () => {
            this.removeTask(folders, tasks, taskObject);
        });
    }
 
    // REMOVE TASK
    removeTask(folders, tasks, taskObject) {
        // TO SERVER
        (async () => {
            const rawResponse = await fetch('http://localhost:3000', {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskObject)
            });
            const content = await rawResponse.json();
            console.log(content);

            folders = content.folders;
            tasks = content.tasks;

            folders.forEach(folder => {
                if (folder.tasksFolder.includes(this.id)) {
                    folder.tasksFolder.splice(this.id, 1);
                    
                    // TO SERVER
                    (async () => {
                        await fetch('http://localhost:3000/tasks', {
                            method: 'DELETE',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({'folders': folders})
                        });
                    })();
                }
            });
            tasks.splice(this, 1);
            $('#' + this.id).remove();

            window.location.reload();
        })();
    }

    // JQUERY EVENTS
    setJQueryEvents(task, content) {
        // DRAGGABLE
        $('#' + task.id).draggable({
            containment: 'parent',
            stack: 'div',
            revert: true
        });
    
        // OPEN - CLOSE
        $('#' + task.id).on('dblclick', () => {
            task.classList.toggle('zoomTask');
            if (task.classList.contains('zoomTask')) {
                $('#' + content.id).css('display', 'block');
            } else {
                $('#' + content.id).css('display', 'none');
            }
        });
    }
}