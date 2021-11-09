const mongoose = require("mongoose");

const todo = require("../models/todo.model");

class TodoService {
  async getAllTodoItems(options) {
    try {
      const filter = Object.create(null);
      return await todo.paginate(filter, options);
    } catch (err) {
      console.error("Get all todo items failed!", err.stack);
      throw err;
    }
  }

  async getTodoItem(id) {
    try {
      const options = Object.create(null);
      const filter = {
        _id: mongoose.Types.ObjectId(id),
      };
      return await todo.paginate(filter, options);
    } catch (err) {
      console.error("Get todo item failed!", err.stack);
      throw err;
    }
  }

  async createTodoItem({ title, description }) {
    try {
      const todoItem = new todo({
        title,
        description,
      });

      return await todoItem.save();
    } catch (err) {
      console.error("Add todo item failed!", err.stack);
      throw err;
    }
  }

  async updateTodoItem(id, { title, description, completed }) {
    try {
      const filter = {
        _id: mongoose.Types.ObjectId(id),
      };

      const updateQuery = {
        $set: {
          title,
          description,
          completed,
        },
      };

      return await todo.updateOne(filter, updateQuery).exec();
    } catch (err) {
      console.error("Update todo item failed!", err.stack);
      throw err;
    }
  }

  async deleteTodoItem(id) {
    try {
      const filter = {
        _id: mongoose.Types.ObjectId(id),
      };

      return await todo.deleteOne(filter).exec();
    } catch (err) {
      console.error("Delete todo item failed!", err.stack);
      throw err;
    }
  }
}

module.exports = new TodoService();
