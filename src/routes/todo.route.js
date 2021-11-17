const express = require("express");
const { Router } = express;
const router = Router();

const { BaseMiddleware } = require("../middlewares");
const { TodoController } = require("../controllers");

router.get("/", BaseMiddleware.validatePaginatedParameters, (req, res, next) =>
  TodoController.getAll(req, res, next)
);
router.get("/:id", (req, res, next) =>
  TodoController.getSpecific(req, res, next)
);
router.post("/", (req, res, next) => TodoController.add(req, res, next));
router.put("/:id", (req, res, next) => TodoController.update(req, res, next));
router.delete("/:id", (req, res, next) =>
  TodoController.delete(req, res, next)
);

module.exports = router;
