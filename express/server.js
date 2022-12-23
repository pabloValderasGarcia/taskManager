// ------- IMPORT EXPRESS -------
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

// ------- IMPORT MONGOOSE -------
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
// MODELS
const Folder = require('./models/Folder');
const Task = require('./models/Task');


// ------- MONGOOSE -------
// CONNECTION
mongoose.connect('mongodb://mongoadmin:secret@localhost:2222/taskDB?authSource=admin', () => {
    console.log('Connect to DB!');
});

// ------- EXPRESS -------
// GENERATORS ID
function* idFolderGenerator() {
    let idFolder = 1;
    while(true) {
        yield idFolder++;
    }
}
function* idTaskGenerator() {
    let idTask = 1;
    while(true) {
        yield idTask++;
    }
}
var idFolder = idFolderGenerator();
var idTask = idTaskGenerator();

// GET
app.get('/', async (req, res) => {
    try {
        const folders = await Folder.find();
        const tasks = await Task.find();

        res.json({message: 'get', folders: folders, tasks: tasks});
    } catch (err) {
        res.json({message: err});
    }
});

// CREATE
app.post('/', async (req, res) => {
    let data = req.body;
    let element = null;
    
    if (req.body.type == 'folder') {
        element = new Folder({
            container: data.container,
            id: 'folder' + idFolder.next().value,
            name: data.name,
            tasksFolder: data.tasksFolder
        });
    } else {
        element = new Task({
            container: data.container,
            id: 'task' + idTask.next().value,
            title: data.title,
            content: data.content
        });
    }
    
    try {
        await element.save();
        res.json({message: 'created', element: element});
    } catch (err) {
        res.json({message: err});
    }
});

// UPDATE
app.put('/', async (req, res) => {
    let element = req.body;

    // TASK IN
    if (element.parent == null) {
        await Folder.replaceOne(
            {id: element.element.id}, 
            {
                container: element.element.container,
                id: element.element.id,
                name: element.element.name,
                tasksFolder: element.element.tasksFolder
            }
        );
        let tasksFolder = element.element.tasks;
        if (tasksFolder.length > 0) {
            for (const task of tasksFolder) {
                await Task.replaceOne(
                    {id: task.id},
                    {
                        container: task.container,
                        id: task.id,
                        title: task.title,
                        content: task.content,
                        idFolder: task.idFolder
                    }
                )
            }
        }
    }
    // TASK OUT
    if (element.parent != null) {
        await Folder.updateOne(
            {id: element.parent.id}, 
            {$pullAll: {
                tasksFolder: [element.element.id]
            }}
        );
        await Task.replaceOne(
            {id: element.element.id},
            {
                container: element.element.container,
                id: element.element.id,
                title: element.element.title,
                content: element.element.content,
                idFolder: element.element.idFolder
            }
        )
    }
    
    res.json({message: 'updated'});
});

// UPDATE POSITION
app.put('/updatePosition', async (req, res) => {
    let data = req.body;
    await Folder.updateOne({id: data.id}, {position: data.position});

    res.json({message: 'position updated'});
})

// DELETE
app.delete('/', async (req, res) => {
    let element = req.body;
    let type = element.type;
    
    try {
        // FOLDER
        if (type == 'folder') {
            // CHECK IF TASKS IN FOLDER BEFORE DELETE
            let folder = await Folder.find({id: element.id});
            if (folder[0].tasksFolder.length > 0) {
                for (const task of folder[0].tasksFolder) {
                    await Task.deleteOne({id: task});
                }
            }
            await Folder.deleteOne({id: element.id});
        }
        // TASK
        else {
            // CHECK IF TASK IN ANY FOLDER BEFORE DELETE
            let folder = await Folder.find({tasksFolder: {$in: [element.id]}});
            if (folder.length > 0) {
                await Folder.updateOne(
                    {id: folder[0].id}, 
                    {$pullAll: {
                        tasksFolder: [element.id]
                    }}
                );
            }
            await Task.deleteOne({id: element.id});
        }

        res.json({message: 'deleted'});
    } catch (err) {
        res.json({message: err});
    }
});

app.delete('/tasks', async (req, res) => {
    let tasks = req.body;
    try {
        for (const task of tasks) {
            await Task.deleteOne({id: task});
        }
        res.json({message: 'deleted'});
    } catch (err) {
        res.json({message: err});
    }
});

app.listen(3000, () => {
    console.log('Server listening port 3000');
});