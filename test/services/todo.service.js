const sinon = require("sinon");
const { assert, expect } = require("chai");
const faker = require("faker");
const mongoose = require("mongoose");

const TodoService = require("../../src/services/todo.service");
const TodoModel = require("../../src/models/todo.model");
const TodoRepository = require("../../src/repositories/todo.repository");
const todoRepository = require("../../src/repositories/todo.repository");
const todoService = require("../../src/services/todo.service");

afterEach(() => {
  sinon.restore();
});

describe("Todo Service", () => {
  const id = mongoose.Types.ObjectId();
  const dummyTodo = {
    _id: id,
    description: faker.lorem.sentence(),
    completed: faker.datatype.boolean(),
    title: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
  };

  describe("#getAllTodoItems", () => {
    const stubArray = [
      {
        _id: mongoose.Types.ObjectId(),
        title: faker.lorem.sentence(),
        completed: false,
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      },
      {
        _id: mongoose.Types.ObjectId(),
        title: faker.lorem.sentence(),
        completed: false,
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      },
      {
        _id: mongoose.Types.ObjectId(),
        title: faker.lorem.sentence(),
        completed: false,
        createdAt: faker.date.past(),
        updatedAt: faker.date.past(),
      },
    ];

    const pipelineResult = [
      {
        data: stubArray,
        count: [
          {
            title: stubArray.length,
          },
        ],
      },
    ];

    it("should return all todo items", async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const todoModelStub = sinon
        .stub(TodoModel, "aggregate")
        .returns(pipelineResult);

      const todoSpy = sinon.spy(TodoService, "getAllTodoItems");
      // Act
      await TodoService.getAllTodoItems({ page, limit });
      //assert
      expect(todoSpy.calledOnce).to.be.true;
    });

    it("should throw exception when page is negative", async () => {
      // Arrange
      const page = -1;
      const limit = 10;
      const todoModelStub = sinon
        .stub(TodoModel, "aggregate")
        .returns(pipelineResult);

      const todoSpy = sinon.spy(TodoService, "getAllTodoItems");
      const todoRepoSpy = sinon.spy(TodoRepository, "getAll");

      try {
        //Act
        await TodoService.getAllTodoItems({ page, limit });
      } catch (err) {
        //Assert
        assert.strictEqual(err.name, "InvalidObjectIdError");
      }
      //Assert
      expect(todoSpy.calledOnce).to.be.true;
      expect(todoRepoSpy.called).to.be.false;
    });

    it("should throw exception when limit is negative", async () => {
      // Arrange
      const page = 1;
      const limit = -1;
      const todoModelStub = sinon
        .stub(TodoModel, "aggregate")
        .returns(pipelineResult);

      const todoSpy = sinon.spy(TodoService, "getAllTodoItems");
      const todoRepoSpy = sinon.spy(TodoRepository, "getAll");

      try {
        //Act
        await TodoService.getAllTodoItems({ page, limit });
      } catch (err) {
        //Assert
        assert.strictEqual(err.name, "InvalidObjectIdError");
      }
      //Assert
      expect(todoSpy.calledOnce).to.be.true;
      expect(todoRepoSpy.called).to.be.false;
    });
  });

  describe("#getTodoItem", () => {
    it("should return specific todo item", async () => {
      //Arrange
      const todoServiceSpy = sinon.spy(TodoService, "getTodoItem");

      const todoGetStub = sinon
        .stub(TodoRepository, "getById")
        .withArgs(id)
        .returns(dummyTodo);
      // Act
      await TodoService.getTodoItem(id);

      // Assert
      expect(todoServiceSpy.calledOnce).to.be.true;
    });

    it("should throw error for invalid object id", async () => {
      const todoServiceSpy = sinon.spy(TodoService, "getTodoItem");
      try {
        //Act
        await TodoService.getTodoItem(null);
      } catch (err) {
        // Assert
        assert.strictEqual(err.name, "InvalidObjectIdError");
      }
      expect(todoServiceSpy.calledOnce).to.be.true;
    });
  });

  describe("#createTodoItem", () => {
    it("should create todo item", async () => {
      //Arrange
      const dummyCreateTodo = {
        title: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
      };
      const todoStub = sinon
        .stub(TodoRepository, "create")
        .withArgs(dummyCreateTodo)
        .returns(dummyTodo);

      const todoSpy = sinon.spy(TodoService, "createTodoItem");

      //Act
      await TodoService.createTodoItem(dummyCreateTodo);

      //Assert
      expect(todoSpy.calledOnce).to.be.true;
    });

    it("should throw error when duplicate item is added", async () => {
      //Arrange
      const dummyCreateTodo = {
        title: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
      };

      const error = new Error();
      error.name = "DuplicateItemError";
      error.code = 11000;

      const todoStub = sinon
        .stub(TodoRepository, "create")
        .withArgs(dummyCreateTodo)
        .onFirstCall()
        .returns(dummyTodo)
        .withArgs(dummyCreateTodo)
        .onSecondCall()
        .throws(error);

      //Act
      await TodoService.createTodoItem(dummyCreateTodo);

      try {
        await TodoService.createTodoItem(dummyCreateTodo);
      } catch (err) {
        // Assert
        assert.strictEqual(err.name, error.name);
      }
    });
  });

  describe("#updateTodoItem", () => {
    it("should update a given todo item", async () => {
      const todoItem = {
        id: dummyTodo._id,
        title: dummyTodo.title,
        description: dummyTodo.description,
        completed: dummyTodo.completed,
      };

      // Arrange
      const todoRepoStub = sinon.stub(TodoRepository, "update");
      const todoServiceStub = sinon.spy(TodoService, "updateTodoItem");

      //Act
      await TodoService.updateTodoItem(todoItem);

      //Assert
      expect(todoServiceStub.calledOnce).to.be.true;
    });

    it("should throw error when no id is specified", async () => {
      const todoItem = {
        id: null,
        title: dummyTodo.title,
        description: dummyTodo.description,
        completed: dummyTodo.completed,
      };

      // Arrange
      const todoRepoStub = sinon.stub(TodoRepository, "update");
      const todoServiceStub = sinon.spy(TodoService, "updateTodoItem");

      //Act
      try {
        await TodoService.updateTodoItem(todoItem);
      } catch (err) {
        //Assert
        expect(todoServiceStub.calledOnce).to.be.true;
        expect(todoRepoStub.calledOnce).to.be.false;
        assert.strictEqual(err.name, "InvalidObjectIdError");
      }
    });
  });

  describe("#deleteTodoItem", () => {
    it("should delete a specific todo item", async () => {
      //Arrange
      const todoStub = sinon
        .stub(TodoRepository, "delete")
        .withArgs(dummyTodo._id);

      const todoSpy = sinon.spy(TodoService, "deleteTodoItem");

      // Act
      await TodoService.deleteTodoItem(dummyTodo._id);

      //Assert
      expect(todoSpy.calledOnce).to.be.true;
      expect(todoStub.calledOnce).to.be.true;
    });

    it("should throw error when no id is passed", async () => {
      // Arrange
      const todoStub = sinon.stub(TodoRepository, "delete");
      try {
        //Act
        await TodoService.deleteTodoItem(null);
      } catch (err) {
        //Assert
        assert.strictEqual(err.name, "InvalidObjectIdError");
      }

      expect(todoStub.calledOnce).to.be.false;
    });
  });
});
