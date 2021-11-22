const request = require("supertest");
const app = require("../../src");
const { assert, expect } = require("chai");
const sinon = require("sinon");
const faker = require("faker");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connect } = require("../../src/config");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const { before, after } = require("mocha");

const Todo = require("../../src/models/todo.model");

let db, mongoServer;
let insertedTodos = [];
before(async () => {
  mongoServer = await MongoMemoryServer.create();
  const connectionString = mongoServer.getUri();
  db = await connect(connectionString);

  const stubArray = [
    {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      completed: false,
    },
    {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      completed: false,
    },
    {
      title: faker.lorem.sentence(),
      description: faker.lorem.paragraph(),
      completed: false,
    },
  ];

  insertedTodos = await Todo.insertMany(stubArray);
});

after(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("GET /api/v1/todo", () => {
  it("should return list of todos", (done) => {
    request(app)
      .get("/api/v1/todo")
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(StatusCodes.OK)
      .then((response) => {
        expect(response.body)
          .to.be.an("object")
          .to.have.all.keys(["next_page", "prev_page", "count", "data"]);
        expect(response.body.data).to.be.an("array");
        expect(response.body.data[0]).to.not.be.undefined;
        expect(response.body.data[0])
          .to.be.an("object")
          .to.have.all.keys([
            "_id",
            "description",
            "completed",
            "title",
            "createdAt",
            "updatedAt",
            "__v",
          ]);
        return done();
      })
      .catch((err) => done(err));
  });

  it("should return BAD REQUEST for invalid page value", (done) => {
    const page = -1;
    request(app)
      .get(`/api/v1/todo?page=${page}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(StatusCodes.BAD_REQUEST)
      .then((response) => {
        done();
      })
      .catch((err) => done(err));
  });

  it("should return BAD REQUEST for invalid limit value", (done) => {
    const limit = -1;
    request(app)
      .get(`/api/v1/todo?limit=${limit}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(StatusCodes.BAD_REQUEST)
      .then((response) => {
        done();
      })
      .catch((err) => done(err));
  });
});

describe("GET /api/v1/todo", () => {
  it("should return a specific Todo item", (done) => {
    const id = insertedTodos[0]._id;
    request(app)
      .get(`/api/v1/todo/${id}`)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .then((response) => {
        expect(response.body)
          .to.be.an("object")
          .to.have.all.keys([
            "__v",
            "createdAt",
            "updatedAt",
            "completed",
            "_id",
            "title",
            "description",
          ]);
        done();
      })
      .catch((err) => {
        console.log("err", err);
        done();
      });
  });
});
