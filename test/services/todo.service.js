const sinon = require("sinon");
const { assert, expect } = require("chai");
const faker = require("faker");
const mongoose = require("mongoose");

const TodoService = require("../../src/services/todo.service");
const TodoModel = require("../../src/models/todo.model");
const TodoRepository = require("../../src/repositories/todo.repository");

describe("Todo Service", () => {
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
  });
});
