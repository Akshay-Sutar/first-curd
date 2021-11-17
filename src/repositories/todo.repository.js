const mongoose = require("mongoose");
const Todo = require("../models/todo.model");

class TodoRepository {
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

    const results = await Todo.aggregate(pipeline);
    const { data, count } = results?.[0];
    const result = {
      next_page: "",
      prev_page: "",
      count: count[0]?.title || 0,
      data: data || [],
    };

    return result;
  }

  getById(id) {
    return Todo.findById(id);
  }

  create({ title, description }) {
    return Todo.create({ title, description });
  }

  update({ id, title, description, completed }) {
    const filter = {
      _id: mongoose.Types.ObjectId(id),
    };

    const updateQuery = {
      title,
      description,
      completed,
    };

    return Todo.updateOne(filter, updateQuery);
  }

  delete(id) {
    const filter = {
      _id: mongoose.Types.ObjectId(id),
    };

    return Todo.deleteOne(filter);
  }
}

module.exports = new TodoRepository();
