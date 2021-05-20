const express = require('express');
const { StatusCodes } = require('http-status-codes');

const todoService = require('../services/todo.service');
const convertErrorToObject = require('../lib/error');
const utils = require('../lib');

// Upper pascal case
class TodoController {
    async getAll(req, res) {
        const options = Object.create(null);
        try {
            if (req.query && req.query.page) {
                options.page = parseInt(req.query.page, 10);
            }

            if (req.query && req.query.limit) {
                options.limit = parseInt(req.query.limit, 10);
            }

            const todoItems = await todoService.getAllTodoItems(options);
            return res.status(StatusCodes.OK).json(todoItems);
        } catch (err) {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(convertErrorToObject(err));
        }
    }

    async getSpecific(req, res) {
        try {
            const { id } = req.params;

            if (!utils.isValidObjectId(id)) {
                const errorResponse = utils.mapResponse('Invalid Id!');
                return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
            }

            const todoItem = await todoService.getTodoItem(id);
            return res.status(StatusCodes.OK).json(todoItem);
        } catch(err) {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(convertErrorToObject(err));
        }
    }

    async add(req, res) {
        try {
            if (!req.body || !req.body.title) {
                const errorResponse = utils.mapResponse('No title specified!');
                return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
            }

            const { title, description } = req.body;
            const todoItem = await todoService.createTodoItem({ title, description });

            return res.status(StatusCodes.CREATED).json(todoItem);
        } catch (err) {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(convertErrorToObject(err));
        }
    }

    async update(req, res) {
        let errorResponse;
        try {
            if (!req.body || !Object.keys(req.body).length) {
                errorResponse = utils.mapResponse('Empty body parameter!');
                return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
            }

            const { id } = req.params;

            if (!utils.isValidObjectId(id)) {
                errorResponse = utils.mapResponse('Invalid Id!');
                return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
            }

            const todoItem = await todoService.getTodoItem(id);
            if (!todoItem) {
                errorResponse = utils.mapResponse('No item found to update!');
                return res.status(StatusCodes.NOT_FOUND).json(errorResponse);
            }

            const { title, description, completed } = req.body;
            const updateResponse = await todoService.updateTodoItem(id, { title, description, completed });

            return res.status(StatusCodes.OK).json(updateResponse);
        } catch (err) {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(convertErrorToObject(err));
        }
    }

    async delete(req, res) {
        let errorResponse;
        try {
            const { id } = req.params;

            if (!utils.isValidObjectId(id)) {
                errorResponse = utils.mapResponse('Invalid Id!');
                return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
            }

            const deleteResult = await todoService.deleteTodoItem(id);
            return res.status(StatusCodes.OK).json(deleteResult);
        } catch (err) {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(convertErrorToObject(err));
        }
    }
}

module.exports = new TodoController();
