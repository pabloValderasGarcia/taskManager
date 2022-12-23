const mongoose = require('mongoose');

const FolderSchema = mongoose.Schema({
    container: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    tasksFolder: {
        type: Array
    },
    position: {
        type: Object
    }
});

module.exports = mongoose.model('folder', FolderSchema);