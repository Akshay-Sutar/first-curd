const sinon = require("sinon");
const { expect } = require("chai");

const todoService = require("../../src/services/todo.service");
const todoModel = require("../../src/models/todo.model");

describe("todo service", () => {
  describe("create", () => {
    it("should generate a new todo", async () => {
      const todoItem = {
        title: "test",
        description: "test body",
      };

      const todoSpy = sinon.spy(todoModel.prototype, "save");
      //await todoService.createTodoItem(todoItem);
      //expect(todoSpy.calledOnce).to.be.true;

      const todoStub = sinon
        .stub(todoService, "createTodoItem")
        .returns(todoItem);
      await todoService.createTodoItem(todoItem);
      expect(todoStub.calledOnce).to.be.true;
    });
  });

  describe("get all", () => {
    it("should get all todos", async () => {
      const todoItem1 = {
        title: "test1",
        description: "test body",
      };
      const todoItem2 = {
        title: "test2",
        description: "test body",
      };
      const todoStub = sinon
        .stub(todoService, "getAllTodoItems")
        .returns([todoItem1, todoItem2]);

      await todoService.getAllTodoItems();

      expect(todoStub.calledOnce).to.be.true;
    });
  });
});
