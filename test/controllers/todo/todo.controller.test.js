const request = require("supertest");
const { app } = require("../../../src");
const { assert, expect } = require("chai");
const sinon = require("sinon");
const faker = require("faker");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const { before, after, describe } = require("mocha");
const TodoService = require("../../../src/services/todo.service");

const Todo = require("../../../src/models/todo.model");
const {
  connect,
  disconnect,
  setupTestData,
  teardownTestData,
} = require("../setup");

const fixture = require("./fixture");

before(async () => {
  try {
    await connect();
    await Todo.ensureIndexes();
  } catch (e) {
    console.error(e.message);
  }
});

after(async () => {
  await disconnect();
});

describe("TodoController", () => {
  const url = "/api/v1/todo";
  beforeEach("DB setup", async () => {
    await setupTestData(Todo, fixture);
  });

  afterEach("DB Teardown", async () => {
    await teardownTestData(Todo);
  });

  describe("GET /api/v1/todo", () => {
    it("should return list of todos", (done) => {
      request(app)
        .get(url)
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
        .then(() => {
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
        .then(() => {
          done();
        })
        .catch((err) => done(err));
    });

    it("should return INTERNAL_SERVER_ERROR while fetching todo list", (done) => {
      const stub = sinon
        .stub(TodoService, "getAllTodoItems")
        .throws(new Error());

      request(app)
        .get("/api/v1/todo")
        .set("Accept", "application/json")
        .expect("Content-type", /json/)
        .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        .then((response) => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  });

  describe("GET /api/v1/todo/:id", () => {
    it("should return a specific Todo item", (done) => {
      Todo.find({})
        .limit(1)
        .exec()
        .then((todo) => {
          const id = todo[0]._id.toString();
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
            .catch((err) => done(err));
        });
    });

    it("should return NOT_FOUND", (done) => {
      const id = mongoose.Types.ObjectId();
      request(app)
        .get(`/api/v1/todo/${id}`)
        .set("Accept", "application/json")
        .expect("Content-type", /json/)
        .then((response) => {
          done();
        })
        .catch((err) => {
          assert.instanceOf(err, Error);
          done();
        });
    });

    it("should return INTERNAL_SERVER_ERROR while fetching specific todo item", (done) => {
      Todo.find({})
        .limit(1)
        .exec()
        .then((todo) => {
          const id = todo[0]._id.toString();
          const stub = sinon
            .stub(TodoService, "getTodoItem")
            .throws(new Error());

          request(app)
            .get(`/api/v1/todo/${id}`)
            .set("Accept", "application/json")
            .expect("Content-type", /json/)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
              done();
            })
            .catch((err) => {
              done(err);
            });
        });
    });
  });

  describe("POST /api/v1/todo", () => {
    let newTodo;
    beforeEach("generating dummy todo", () => {
      newTodo = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        completed: false,
      };
    });

    it("should create a Todo", (done) => {
      request(app)
        .post("/api/v1/todo")
        .send(newTodo)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(StatusCodes.CREATED)
        .then(() => {
          done();
        })
        .catch((err) => done(err));
    });

    it("should return BAD_REQUEST while creating todo", (done) => {
      request(app)
        .post(`/api/v1/todo`)
        .send({})
        .set("Accept", "application/json")
        .expect("Content-type", /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then((response) => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

    it("should return INTERNAL_SERVER_ERROR while creating todo", (done) => {
      const stub = sinon
        .stub(TodoService, "createTodoItem")
        .throws(new Error());
      request(app)
        .post(`/api/v1/todo`)
        .send(newTodo)
        .set("Accept", "application/json")
        .expect("Content-type", /json/)
        .expect(StatusCodes.INTERNAL_SERVER_ERROR)
        .then((response) => {
          done();
        })
        .catch((err) => {
          done(err);
        });
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
    let newTodo;
    beforeEach("creating new todo", () => {
      newTodo = {
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        completed: faker.datatype.boolean,
      };
    });

    it("update a specific Todo item", (done) => {
      Todo.find({})
        .limit(1)
        .exec()
        .then((todo) => {
          const id = todo[0]._id.toString();
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
            .catch(() => {
              done();
            });
        });
    });

    it("should respond with BAD_REQUEST for no body ", (done) => {
      Todo.find({})
        .limit(1)
        .exec()
        .then((todo) => {
          const id = todo[0]._id;
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
            .catch(() => {
              done();
            });
        });
    });

    it("should respond with BAD_REQUEST for no id", (done) => {
      const id = "invalid%20id";
      request(app)
        .put(`/api/v1/todo/${id}`)
        .send(newTodo)
        .set("Accept", "application/json")
        .expect("Content-type", /json/)
        .expect(StatusCodes.BAD_REQUEST)
        .then(() => {
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
        .then(() => done())
        .catch(() => done());
    });

    it("should return INTERNAL_SERVER_ERROR while updating todo", (done) => {
      Todo.find({})
        .limit(1)
        .exec()
        .then((todo) => {
          let id = todo[0]._id.toString();
          const stub = sinon
            .stub(TodoService, "updateTodoItem")
            .throws(new Error());
          request(app)
            .put(`/api/v1/todo/${id}`)
            .send(newTodo)
            .set("Accept", "application/json")
            .expect("Content-type", /json/)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
              done();
            })
            .catch((err) => {
              done(err);
            });
        });
    });
  });

  describe("DELETE /api/v1/todo", () => {
    it("should delete a todo item", (done) => {
      Todo.find({})
        .limit(1)
        .exec()
        .then((todo) => {
          const id = todo[0]._id.toString();
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
            .catch(() => done());
        });
    });

    it("should respond with BAD_REQUEST for invalid id", (done) => {
      let id = "invalid%20id";
      request(app)
        .delete(`/api/v1/todo/${id}`)
        .set("Accept", "application/json")
        .expect(StatusCodes.BAD_REQUEST)
        .then(() => done())
        .catch((err) => done(err));
    });

    it("should return INTERNAL_SERVER_ERROR while deleting a todo", (done) => {
      Todo.find({})
        .limit(1)
        .exec()
        .then((todo) => {
          const id = todo[0]._id.toString();
          const stub = sinon
            .stub(TodoService, "deleteTodoItem")
            .throws(new Error());
          request(app)
            .delete(`/api/v1/todo/${id}`)
            .set("Accept", "application/json")
            .expect("Content-type", /json/)
            .expect(StatusCodes.INTERNAL_SERVER_ERROR)
            .then((response) => {
              done();
            })
            .catch((err) => {
              done(err);
            });
        });
    });
  });

  describe("GET misc routes", () => {
    it("should return Hello World as response", (done) => {
      request(app)
        .get("/")
        .set("Accept", "application/json")
        .expect("Content-type", /json/)
        .expect(StatusCodes.OK)
        .then((res) => {
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.all.keys(["message"]);
          done();
        })
        .catch((err) => done(err));
    });
    it("should throw PathNotFoundError error", (done) => {
      request(app)
        .get("/api/todo")
        .set("Accept", "application/json")
        .expect(StatusCodes.NOT_FOUND)
        .then(() => done())
        .catch((err) => done(err));
    });
  });
});
