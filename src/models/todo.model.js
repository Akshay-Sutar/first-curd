const mongoose = require("mongoose");
const { Schema } = mongoose;

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

todoSchema.index({ title: 1, description: 1 }, { unqiue: true });

module.exports = mongoose.model("todo", todoSchema, "todo");
