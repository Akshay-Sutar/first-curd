const express = require('express');
const { StatusCodes } = require("http-status-codes");
const { Router } = express;

const router = Router();

router.get("/", (req, res, next) => res.status(StatusCodes.OK).json({ message: "Hello world!" }));
router.use('/api/v1/todo', require('./todo.route'));

module.exports = router;
