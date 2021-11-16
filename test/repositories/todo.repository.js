const { assert, expect } = require("chai");
const sinon = require("sinon");
const mongoose = require("mongoose");
const faker = require("faker");

const TodoModel = require("../../src/models/todo.model");
const TodoRepository = require("../../src/repositories/todo.repository");

afterEach(() => {
  sinon.restore();
});

describe("Todo repository", () => {
  const id = mongoose.Types.ObjectId();
  const todoStub = {
    _id: id,
    description: faker.lorem.sentence(),
    completed: faker.datatype.boolean(),
    title: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.past(),
    __v: 0,
  };

  describe("#getAll", () => {
    const title = faker.lorem.sentence();
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
        title,
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

    it("should return 3 todos", async () => {
      // Arrange
      const offset = 0;
      const limit = 10;

      sinon.stub(TodoModel, "aggregate").returns(pipelineResult);

      // Act
      const todos = await TodoRepository.getAll({ offset, limit });

      // Assert
      assert.strictEqual(todos.data.length, stubArray.length);
      assert.strictEqual(todos.count, stubArray.length);
    });
  });

  describe("#getById", () => {
    it("should return specific todo item", async (done) => {
      const mockOne = {
        exec: () => {
          return new Promise((resolve, reject) => {
            resolve(todoStub);
            done();
          });
        },
      };
      const stub = sinon.stub(TodoModel, "findById").returns(mockOne);
      const todoObj = await TodoRepository.getById(id);

      expect(stub.calledOnce).to.be.true;
      assert.strictEqual(todoStub._id.toString(), todoObj._id.toString());
      assert.strictEqual(todoStub.title, todoObj.title);
      assert.strictEqual(todoStub.description, todoObj.description);
      assert.strictEqual(todoStub.completed, todoObj.completed);
      assert.strictEqual(todoStub.createdAt, todoObj.createdAt);
      assert.strictEqual(todoStub.updatedAt, todoObj.updatedAt);
    });
  });

  describe("#create", () => {
    it("should create a new todo", async () => {
      const todoMock = sinon.stub(TodoModel, "create").returns(todoStub);

      const newTodo = await TodoRepository.create(todoStub);

      expect(todoMock.calledOnce).to.be.true;
      assert.strictEqual(todoStub._id.toString(), newTodo._id.toString());
      assert.strictEqual(todoStub.title, newTodo.title);
      assert.strictEqual(todoStub.description, newTodo.description);
      assert.strictEqual(todoStub.completed, newTodo.completed);
      assert.strictEqual(todoStub.createdAt, newTodo.createdAt);
      assert.strictEqual(todoStub.updatedAt, newTodo.updatedAt);
    });
  });

  describe("#update", () => {
    it("should update the todo", async () => {
      const returnObj = {
        n: 1,
        nModified: 1,
        ok: 1,
      };

      const { id, title, description, completed } = todoStub;

      const todoMock = sinon
        .stub(TodoModel, "updateOne")
        .withArgs({ _id: id }, todoStub)
        .returns(returnObj);

      const todoUpdate = await TodoRepository.update(id, {
        title,
        description,
        completed,
      });

      expect(todoMock.calledOnce).to.be.true;
      assert.strictEqual(todoUpdate.n, returnObj.n);
      assert.strictEqual(todoUpdate.nModified, returnObj.nModified);
      assert.strictEqual(todoUpdate.ok, returnObj.ok);
    });
  });
});
