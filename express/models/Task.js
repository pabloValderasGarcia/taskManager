const mongoose = require('mongoose');

const TaskSchema = mongoose.Schema({
    container: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    idFolder: {
        type: String
    }
});

module.exports = mongoose.model('task', TaskSchema);