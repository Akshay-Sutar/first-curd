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
        const id="6149a0f9c48fbc27bc12dba8";
      chai
        .request(server)
        .get("/api/todo/"+id)
        .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.have.nested.property('docs[0]._id');
            done();
        });
    });
  });
});
