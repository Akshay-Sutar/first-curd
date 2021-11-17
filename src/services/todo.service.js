const TodoRepository = require("../repositories/todo.repository");
const { isValidObjectId } = require("../lib");
const { DuplicateItemError } = require("../errors");

class TodoService {
  getAllTodoItems({ page, limit }) {
    if (page < 0 || limit < 0) {
      throw new InvalidObjectIdError("Invalid query parameters");
    }
    return TodoRepository.getAll({ page, limit });
  }

  getTodoItem(id) {
    if (isValidObjectId(id)) {
      throw new InvalidObjectIdError();
    }

    return TodoRepository.getById(id);
  }

  async createTodoItem({ title, description }) {
    try {
      const todoItem = {
        title,
        description,
      };

      return await TodoRepository.create(todoItem);
    } catch (err) {
      if (err.code === 11000) {
        throw new DuplicateItemError();
      }

      throw err;
    }
  }

  updateTodoItem({ id, title, description, completed }) {
    if (isValidObjectId(id)) {
      throw new InvalidObjectIdError();
    }

    return TodoRepository.update({ id, title, description, completed });
  }

  deleteTodoItem(id) {
    if (isValidObjectId(id)) {
      throw new InvalidObjectIdError();
    }

    const filter = {
      _id: mongoose.Types.ObjectId(id),
    };

    return todo.deleteOne(filter);
  }
}

module.exports = new TodoService();
