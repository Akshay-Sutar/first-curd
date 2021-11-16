const mongoose = require("mongoose");
const todo = require("../models/todo.model");

class TodoRepository {
  constructor() {
    this.todo = todo;
  }
  async getAll({ page, limit }) {
    const offset = (page - 1) * limit;
    const pipeline = [
      {
        $facet: {
          data: [
            {
              $skip: offset,
            },
            {
              $limit: limit,
            },
          ],
          count: [
            {
              $count: "title",
            },
          ],
        },
      },
    ];

    const results = await this.todo.aggregate(pipeline);
    const { data, count } = results?.[0];
    const result = {
      next_page: "",
      prev_page: "",
      count: count[0]?.title || 0,
      data: data || [],
    };

    return result;
  }

  async getById(id) {
    return await todo.findById(id).exec();
  }

  async create({ title, description }) {
    try {
      const todoItem = new todo({
        title,
        description,
      });
      return await todo.create(todoItem);
    } catch (err) {
      throw err;
    }
  }

  async update(id, { title, description, completed }) {
    try {
      const filter = {
        _id: mongoose.Types.ObjectId(id),
      };

      const updateQuery = {
        title,
        description,
        completed,
      };

      return await todo.updateOne(filter, updateQuery);
    } catch (err) {
      console.error("Update todo item failed!", err.stack);
      throw err;
    }
  }

  async delete(id) {
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

module.exports = new TodoRepository();
