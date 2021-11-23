const TodoRepository = require("../repositories/todo.repository");
const { isValidObjectId } = require("../utils");
const {
  DuplicateItemError,
  InvalidObjectIdError,
  InvalidRequestParametersError,
} = require("../utils/errors");

class TodoService {
  getAllTodoItems({ page, limit }) {
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);
    if (page < 1 || limit < 1 || isNaN(page) || isNaN(limit)) {
      throw new InvalidRequestParametersError("Invalid pagination parameters");
    }
    return TodoRepository.getAll({ page, limit });
  }

  getTodoItem(id) {
    if (!isValidObjectId(id)) {
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
    if (!isValidObjectId(id)) {
      throw new InvalidObjectIdError();
    }
    return TodoRepository.update({ id, title, description, completed });
  }

  deleteTodoItem(id) {
    if (!isValidObjectId(id)) {
      throw new InvalidObjectIdError();
    }

    return TodoRepository.delete(id);
  }
}

module.exports = new TodoService();
