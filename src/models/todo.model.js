const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const { Schema } = mongoose;

const todoSchema = new Schema({ 
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    completed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

todoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('todo', todoSchema, 'todo');
