const express = require('express');
const { Router } = express;
const router = Router();

const todoController = require('../controllers/todo.controller');

router.get('/', (req, res) => todoController.getAll(req, res));
router.get('/:id', (req, res) => todoController.getSpecific(req, res));
router.post('/', (req, res) => todoController.add(req, res));
router.put('/:id', (req, res) => todoController.update(req, res));
router.delete('/:id', (req, res) => todoController.delete(req, res));

module.exports = router;
