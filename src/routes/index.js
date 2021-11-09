const express = require('express');
const { Router } = express;

const router = Router();
router.use('/api/todo', require('./todo.route'));
module.exports = router;
