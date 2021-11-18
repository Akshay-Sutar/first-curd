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

    const emptyResult = [
      {
        data: [],
        count: 0,
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

    it("should return nothing in data", async () => {
      const offset = -1;
      const limit = -1;

      //assign
      const stub = sinon.stub(TodoModel, "aggregate").returns(emptyResult);

      // act
      const todos = await TodoRepository.getAll({ offset, limit });

      //assert
      expect(stub.calledOnce).to.be.true;
      assert.strictEqual(todos.data.length, 0);
      assert.strictEqual(todos.count, 0);
    });
  });

  describe("#getById", () => {
    it("should return specific todo item", async () => {
      //Arrange
      const stub = sinon.stub(TodoModel, "findById").returns(todoStub);

      //Act
      const todoObj = await TodoRepository.getById(id);

      //Assert
      expect(stub.calledOnce).to.be.true;
      assert.strictEqual(todoStub._id.toString(), todoObj._id.toString());
      assert.strictEqual(todoStub.title, todoObj.title);
      assert.strictEqual(todoStub.description, todoObj.description);
      assert.strictEqual(todoStub.completed, todoObj.completed);
      assert.strictEqual(todoStub.createdAt, todoObj.createdAt);
      assert.strictEqual(todoStub.updatedAt, todoObj.updatedAt);
    });

    it("should return null for invalid id", async () => {
      //Arrange
      const fakeId = faker.datatype.number();
      const stub = sinon.stub(TodoModel, "findById").returns(null);

      //Act
      const todoObj = await TodoRepository.getById(fakeId);

      //Assert
      expect(stub.calledOnce).to.be.true;
      assert.strictEqual(todoObj, null);
    });
  });

  describe("#create", () => {
    it("should create a new todo", async () => {
      //Arrange
      const todoMock = sinon.stub(TodoModel, "create").returns(todoStub);
      //Act
      const newTodo = await TodoRepository.create(todoStub);
      //Assert
      expect(todoMock.calledOnce).to.be.true;
      assert.strictEqual(todoStub._id.toString(), newTodo._id.toString());
      assert.strictEqual(todoStub.title, newTodo.title);
      assert.strictEqual(todoStub.description, newTodo.description);
      assert.strictEqual(todoStub.completed, newTodo.completed);
      assert.strictEqual(todoStub.createdAt, newTodo.createdAt);
      assert.strictEqual(todoStub.updatedAt, newTodo.updatedAt);
    });

    it("should throw exception when adding duplicate todo", async () => {
      //Arrange
      const error = new Error();
      error.name = "MongoError";
      error.code = 11000;

      const newTodo = {
        title: todoStub.title,
        description: todoStub.description,
      };

      sinon
        .stub(TodoModel, "create")
        .withArgs(newTodo)
        .onFirstCall()
        .returns(todoStub)
        .withArgs(newTodo)
        .onSecondCall()
        .throws(error);

      //Act
      await TodoRepository.create(newTodo);

      try {
        await TodoRepository.create(newTodo);
      } catch (e) {
        //Assert
        assert.strictEqual(e.code, error.code);
        assert.strictEqual(e.name, error.name);
      }
    });
  });

  describe("#update", () => {
    it("should update the todo", async () => {
      // Arrange
      const returnObj = {
        n: 1,
        nModified: 1,
        ok: 1,
      };

      const { _id, createdAt, updatedAt, ...payload } = todoStub;

      const todoMock = sinon
        .stub(TodoModel, "updateOne")
        .withArgs({ _id: id }, payload)
        .returns(returnObj);

      // Act
      const todoUpdate = await TodoRepository.update({ id, ...payload });

      // Assert
      expect(todoMock.calledOnce).to.be.true;
      assert.strictEqual(todoUpdate.n, returnObj.n);
      assert.strictEqual(todoUpdate.nModified, returnObj.nModified);
      assert.strictEqual(todoUpdate.ok, returnObj.ok);
    });

    it("should not update if id is not provided", async () => {
      // Arrange
      const updateDto = {
        id: mongoose.Types.ObjectId().toString(),
        title: faker.lorem.sentence(),
        completed: true,
        description: faker.lorem.sentence(),
      };
      const filter = {
        _id: mongoose.Types.ObjectId(updateDto.id),
      };
      const payload = {
        title: updateDto.title,
        description: updateDto.description,
        completed: updateDto.completed,
      };
      const writeConcernResult = {
        n: 0,
        nModified: 0,
      };

      const stub = sinon
        .stub(TodoModel, "updateOne")
        .withArgs(filter, payload)
        .returns(writeConcernResult);

      // Act
      const updateResult = await TodoRepository.update(updateDto);

      // Assert
      expect(stub.calledOnce).to.be.true;
      assert.strictEqual(updateResult.n, writeConcernResult.n);
      assert.strictEqual(updateResult.nModified, writeConcernResult.nModified);
    });
  });
});
