const express = require("express");
const { StatusCodes } = require("http-status-codes");

const todoService = require("../services/todo.service");
const { isValidObjectId } = require("../utils");

class TodoController {
  async getAll(req, res, next) {
    try {
      const todoItems = await todoService.getAllTodoItems(req.query);
      return res.status(StatusCodes.OK).json(todoItems);
    } catch (err) {
      return next(err);
    }
  }

  async getSpecific(req, res, next) {
    try {
      const todoItem = await todoService.getTodoItem(req.params.id);
      if (!todoItem) {
        return res.status(StatusCodes.NOT_FOUND).end();
      }
      return res.status(StatusCodes.OK).json(todoItem);
    } catch (err) {
      return next(err);
    }
  }

  async add(req, res, next) {
    try {
      if (!req.body || !req.body.title) {
        const errorResponse = {}; //utils.mapResponse("No title specified!");
        return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
      }

      const { title, description } = req.body;
      const todoItem = await todoService.createTodoItem({ title, description });

      // Set location header to point to newly created resource
      const fullUrl = [
        req.protocol,
        "://",
        req.get("host"),
        req.baseUrl,
        req.path,
        todoItem._id,
      ].join("");
      res.location(fullUrl);

      return res.status(StatusCodes.CREATED).json(todoItem);
    } catch (err) {
      return next(err);
    }
  }

  async update(req, res, next) {
    let errorResponse;
    try {
      if (!req.body || !Object.keys(req.body).length) {
        errorResponse = {}; //utils.mapResponse("Empty body parameter!");
        return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
      }

      const { id } = req.params;

      if (!isValidObjectId(id)) {
        errorResponse = {}; //utils.mapResponse("Invalid Id!");
        return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
      }

      const todoItem = await todoService.getTodoItem(id);
      if (!todoItem) {
        errorResponse = {}; //utils.mapResponse("No item found to update!");
        return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
      }

      const { title, description, completed } = req.body;
      const updateResponse = await todoService.updateTodoItem({
        id,
        title,
        description,
        completed,
      });

      return res.status(StatusCodes.OK).json(updateResponse);
    } catch (err) {
      return next(err);
    }
  }

  async delete(req, res, next) {
    let errorResponse;
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        errorResponse = {}; //utils.mapResponse("Invalid Id!");
        return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
      }

      const deleteResult = await todoService.deleteTodoItem(id);
      return res.status(StatusCodes.OK).json(deleteResult);
    } catch (err) {
      return next(err);
    }
  }
}

module.exports = new TodoController();
