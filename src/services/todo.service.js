const TodoRepository = require("../repositories/todo.repository");

class TodoService {
  getAllTodoItems(options) {
    return TodoRepository.getAll(options);
  }

  async getTodoItem(id) {
    return TodoRepository.getById(id);
  }

  async createTodoItem({ title, description }) {
    const todoItem = {
      title,
      description,
    };

    return TodoRepository.create(todoItem);
  }

  async updateTodoItem(id, { title, description, completed }) {
    const updatedTodo = {
      title,
      description,
      completed,
    };

    return TodoRepository.update(id, updatedTodo);
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
