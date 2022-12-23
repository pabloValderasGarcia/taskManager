export class Config {
    init() {
        // DELETE EVENT SELECTING
        var deleteElementEvent = (event, tasks) => {
            if (event.key == 'Backspace') {
                this.deleteElement(tasks);
            }
        }

        let tasks = [];
        $('#container').selectable({
            filter: '.task',
            selecting: (event, ui) => {
                ui.selecting.classList.add('selected');
                tasks.push(ui.selecting.id);
                window.addEventListener('keyup', (event) => {
                    deleteElementEvent(event, tasks);
                });
            },
            unselecting: function(event, ui) {
                ui.unselecting.classList.remove('selected');
                tasks.splice(ui.unselecting.id, 1);
                window.removeEventListener('keyup', (event) => deleteElementEvent(event, tasks));
            }
        });
    }

    deleteElement(tasks) {
        tasks.forEach(task => {
            $('#' + task).remove();
        });
        (async () => {
            const rawResponse = await fetch('http://localhost:3000/tasks', {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tasks)
            });
            const content = await rawResponse.json();
            console.log(content);
        })();
    }
}