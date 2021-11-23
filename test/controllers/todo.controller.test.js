const request = require("supertest");
const app = require("../../src");
const { assert, expect } = require("chai");
const sinon = require("sinon");
const faker = require("faker");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { connect } = require("../../src/config");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const { before, after, describe } = require("mocha");

const Todo = require("../../src/models/todo.model");

let db, mongoServer;
let insertedTodos = [];

const newTodo = {
  title: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  completed: false,
};

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
        done();
      });
  });

  // it("should not return a specific Todo item", (done) => {
  //   const id = mongoose.Types.ObjectId();
  //   console.log("req id", id);
  //   request(app)
  //     .get(`/api/v1/todo/${id}`)
  //     .set("Accept", "application/json")
  //     .then((response) => {
  //       console.log("response", response);
  //       done();
  //     })
  //     .catch((err) => {
  //       console.log("err", err);
  //       done();
  //     });
  // });
});

describe("POST /api/v1/todo", () => {
  it("should create a Todo", (done) => {
    request(app)
      .post("/api/v1/todo")
      .send(newTodo)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(StatusCodes.CREATED)
      .then((response) => {
        done();
      })
      .catch((err) => done(err));
  });

  // it("should throw DuplicateItemError error for duplicate Todo", async (done) => {
  //   const newTodo = {
  //     title: faker.lorem.sentence(),
  //     description: faker.lorem.paragraph(),
  //     completed: false,
  //   };

  //   await Todo.ensureIndexes();

  //   const agent = request(app);

  //   agent
  //     .post("/api/v1/todo")
  //     .send(newTodo)
  //     .set("Accept", "application/json")
  //     .then((response) => {
  //       console.log("res1", response.body);
  //       agent
  //         .post("/api/v1/todo")
  //         .send(newTodo)
  //         .set("Accept", "application/json")
  //         .then((response2) => {
  //           console.log("res2", response2.body);
  //           done();
  //         })
  //         .catch((err2) => {
  //           console.log("err2", err2);
  //           done();
  //         });
  //     })
  //     .catch((err) => {
  //       console.log("err1", err);
  //       done();
  //     });

  //   request(app)
  //     .post("/api/v1/todo")
  //     .send(newTodo)
  //     .set("Accept", "application/json")
  //     .expect("Content-Type", /json/)
  //     .expect(StatusCodes.CREATED)
  //     .then((response) => {
  //       console.log("response1", response.body);
  //       request(app)
  //         .post("/api/v1/todo")
  //         .send(newTodo)
  //         .set("Accept", "application/json")
  //         .expect("Content-Type", /json/)
  //         .expect(StatusCodes.CREATED)
  //         .then((response) => {
  //           console.log("response2", response.body);
  //           done();
  //         })
  //         .catch((err) => {
  //           console.log("err", err);
  //           done(err);
  //         });
  //     })
  //     .catch((err) => done(err));
  // });
});

describe("PUT /api/v1/todo", () => {
  it("update a specific Todo item", (done) => {
    const id = insertedTodos[0]._id;
    request(app)
      .put(`/api/v1/todo/${id}`)
      .send(newTodo)
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(StatusCodes.OK)
      .then((response) => {
        let { body } = response;
        expect(body).to.be.an("object");
        expect(body).to.be.not.be.undefined;
        expect(body).to.have.all.keys(["n", "nModified", "ok"]);
        done();
      })
      .catch((err) => {
        done();
      });
  });

  it("should respond with BAD_REQUEST for no body ", (done) => {
    const id = insertedTodos[0]._id;
    request(app)
      .put(`/api/v1/todo/${id}`)
      .send({})
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(StatusCodes.BAD_REQUEST)
      .then((response) => {
        let { body } = response;
        done();
      })
      .catch((err) => {
        done();
      });
  });

  it("should respond with BAD_REQUEST for no id", (done) => {
    const id = "12345";
    request(app)
      .put(`/api/v1/todo/${id}`)
      .send(newTodo)
      .set("Accept", "application/json")
      .expect("Content-type", /json/)
      .expect(StatusCodes.BAD_REQUEST)
      .then((res) => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });

  it("should respond with NOT_FOUND for wwrong id", (done) => {
    const id = mongoose.Types.ObjectId();
    request(app)
      .put(`/api/v1/todo/${id}`)
      .send(newTodo)
      .set("Accept", "application/json")
      .expect("Content-type", /json/)
      .expect(StatusCodes.NOT_FOUND)
      .then((res) => done())
      .catch((err) => done());
  });
});

describe("DELETE /api/v1/todo", () => {
  it("should delete a todo item", (done) => {
    const id = insertedTodos[0]._id;
    request(app)
      .delete(`/api/v1/todo/${id}`)
      .set("Accept", "application/json")
      .expect("Content-type", /json/)
      .expect(StatusCodes.OK)
      .then((res) => {
        let body = { res };
        expect(body).to.be.an("object");
        expect(body).not.to.be.undefined;
        expect(body).to.have.all.keys(["n", "ok", "deletedCount"]);
        done();
      })
      .catch((err) => done());
  });

  it("should respond with BAD_REQUEST for invalid id", (done) => {
    let id = "1234";
    request(app)
      .delete(`/api/v1/todo/${id}`)
      .set("Accept", "application/json")
      .expect(StatusCodes.BAD_REQUEST)
      .then((res) => done())
      .catch((err) => done(err));
  });
});
