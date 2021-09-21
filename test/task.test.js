const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../index");

chai.should();

chai.use(chaiHttp);

describe("Todo API", () => {
  describe("GET /api/todo", () => {
    it("should get All TODOs ", (done) => {
      chai
        .request(server)
        .get("/api/todo")
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          done();
        });
    });

    it("should not get TODOs ", (done) => {
      chai
        .request(server)
        .get("/api/todos")
        .end((err, response) => {
          response.should.have.status(404);
          done();
        });
    });
  });

  describe("GET /api/todo/:id", () => {
    it("should get specific todo", (done) => {
      const id = "6149c3b676ed4b61807391bb";
      chai
        .request(server)
        .get("/api/todo/" + id)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          response.body.should.have.nested.property("docs[0]._id");
          done();
        });
    });

    it("should return 404", (done) => {
      const id = 1;
      chai
        .request(server)
        .get("/api/todo/" + id)
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a("object");
          done();
        });
    });
  });

  describe("POST /api/todo", () => {
    it("should create a new todo", (done) => {
      const todoItem = {
        title: "Test Case 2",
        description: "Test Case 2 is a POST API test case",
      };
      chai
        .request(server)
        .post("/api/todo")
        .send(todoItem)
        .end((err, response) => {
          response.should.have.status(201);
          response.body.should.be.a("object");
          response.body.should.have.property("_id");
          response.body.should.have.property("title").eq(todoItem.title);
          done();
        });
    });

    it("should not create a new todo", (done) => {
      const todoItem = {
        description: "Test Case 2 is a POST API test case",
      };
      chai
        .request(server)
        .put("/api/todo")
        .send(todoItem)
        .end((err, response) => {
          response.should.have.status(404);
          response.body.should.be.a("object");
          response.body.should.have
            .property("message")
            .eq("No title specified!");
          done();
        });
    });
  });

  describe("PUT /api/todo/:id", () => {
    it("should update an existing todo", (done) => {
      const todoItem = {
        title: "Complete Mocha",
        description: "Complete Mocha framework with Chai-Sinon",
        completed: true,
      };
      const id = "6149c3b676ed4b61807391bb";
      chai
        .request(server)
        .put("/api/todo/" + id)
        .send(todoItem)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          response.body.should.have.property("nModified").eq(1);
          done();
        });
    });
  });

  describe("Delete /api/todo/:id", () => {
    it("should delete an existing todo", (done) => {
      const id = "6149c3b676ed4b61807391bb";
      chai
        .request(server)
        .delete("/api/todo/" + id)
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a("object");
          response.body.should.have.property("deletedCount").eq(1);
          done();
        });
    });

    it("should delete give 404 error", (done) => {
      const id = 1;
      chai
        .request(server)
        .delete("/api/todo/" + id)
        .end((err, response) => {
          response.should.have.status(400);
          response.body.should.be.a("object");
          response.body.should.have.property("message").eq("Invalid Id!");
          done();
        });
    });
  });
});
