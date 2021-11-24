const sinon = require("sinon");
const { assert, expect } = require("chai");
const faker = require("faker");
const mongoose = require("mongoose");

const { TodoService } = require("../../../src/services");
const { TodoRepository } = require("../../../src/repositories");
const {
  InvalidObjectIdError,
  DuplicateItemError,
  InvalidRequestParametersError,
} = require("../../../src/utils/errors");

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
    it("should return all todo items", async () => {
      // Arrange
      const page = 1;
      const limit = 10;
      const stubResponse = {
        pages: 1,
        first_page: "/api/v1/todo?page=1&limit=10",
        last_page: "/api/v1/todo?page=1&limit=10",
        prev_page: "/api/v1/todo?page=1&limit=10",
        next_page: "/api/v1/todo?page=1&limit=10",
        page_size: 10,
        total_count: 1,
        data: [
          {
            _id: mongoose.Types.ObjectId(),
            title: faker.lorem.sentence(),
            completed: false,
            createdAt: faker.date.past(),
            updatedAt: faker.date.past(),
          },
        ],
      };

      const stub = sinon.stub(TodoRepository, "getAll").returns(stubResponse);

      // Act
      await TodoService.getAllTodoItems({ page, limit });

      //assert
      expect(stub.calledOnce).to.be.true;
    });
  });

  describe("#getTodoItem", () => {
    it("should return specific todo item", async () => {
      //Arrange
      const stub = sinon
        .stub(TodoRepository, "getById")
        .withArgs(id)
        .returns(dummyTodo);

      // Act
      await TodoService.getTodoItem(id);

      // Assert
      expect(stub.calledOnce).to.be.true;
    });

    it("should throw error for invalid object id", async () => {
      const todoServiceSpy = sinon.spy(TodoService, "getTodoItem");
      const invalidId = "Invalid id";
      try {
        //Act
        await TodoService.getTodoItem(invalidId);
      } catch (err) {
        // Assert
        assert.instanceOf(err, InvalidObjectIdError);
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
      const stub = sinon
        .stub(TodoRepository, "create")
        .withArgs(dummyCreateTodo)
        .returns(dummyTodo);

      //Act
      await TodoService.createTodoItem(dummyCreateTodo);

      //Assert
      expect(stub.calledOnce).to.be.true;
    });

    it("should throw DuplicateItemError when duplicate item is added", async () => {
      //Arrange
      const dummyCreateTodo = {
        title: faker.lorem.sentence(),
        description: faker.lorem.sentence(),
      };

      const error = new Error();
      error.name = "DuplicateItemError";
      error.code = 11000;

      const stub = sinon
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
        expect(stub.calledTwice).to.be.true;
        assert.instanceOf(err, DuplicateItemError);
      }
    });

    it("should throw error when todo with incorrect type is added", async () => {
      //Arrange
      const newTodo = {
        title: faker.datatype.number(),
        description: faker.datatype.number(),
      };

      const error = new Error();
      error.name = "Invalid datatype";

      const stub = sinon
        .stub(TodoRepository, "create")
        .withArgs(newTodo)
        .throws(error);

      try {
        await TodoService.createTodoItem(newTodo);
      } catch (err) {
        expect(stub.calledOnce).to.be.true;
        assert.instanceOf(err, Error);
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
      const writeConcernResult = {
        n: 1,
        nModified: 1,
      };

      // Arrange
      const stub = sinon
        .stub(TodoRepository, "update")
        .withArgs(todoItem)
        .returns(writeConcernResult);

      //Act
      await TodoService.updateTodoItem(todoItem);

      //Assert
      expect(stub.calledOnce).to.be.true;
    });

    it("should throw error when no id is specified", async () => {
      const todoItem = {
        id: "1234",
        title: dummyTodo.title,
        description: dummyTodo.description,
        completed: dummyTodo.completed,
      };

      const returnObj = {
        n: 1,
        nModified: 1,
        ok: 1,
      };

      // Arrange
      const todoServiceStub = sinon
        .stub(TodoRepository, "update")
        .withArgs(todoItem)
        .returns(returnObj);

      //Act
      try {
        await TodoService.updateTodoItem(todoItem);
      } catch (err) {
        //Assert
        expect(todoServiceStub.calledOnce).to.be.false;
        assert.instanceOf(err, InvalidObjectIdError);
      }
    });
  });

  describe("#deleteTodoItem", () => {
    it("should delete a specific todo item", async () => {
      //Arrange
      const writeConcern = {
        n: 1,
        ok: 1,
        deletedCount: 1,
      };

      const stub = sinon
        .stub(TodoRepository, "delete")
        .withArgs(dummyTodo._id)
        .returns(writeConcern);

      // Act
      await TodoService.deleteTodoItem(dummyTodo._id);

      //Assert
      expect(stub.calledOnce).to.be.true;
    });

    it("should throw error when no id is passed", async () => {
      // Arrange
      const id = "Invalid id";
      const stub = sinon
        .stub(TodoRepository, "delete")
        .withArgs(id)
        .throws(new InvalidObjectIdError());

      try {
        //Act
        await TodoService.deleteTodoItem(id);
      } catch (err) {
        //Assert
        assert.instanceOf(err, InvalidObjectIdError);
      }

      expect(stub.calledOnce).to.be.false;
    });
  });
});
