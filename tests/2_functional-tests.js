const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);
let id;
suite("Functional Tests", function () {
  test("all field", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/testapi")
      .send({
        issue_title: "test",
        issue_text: "test",
        created_by: "test",
        assigned_to: "test",
        status_text: "test",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        id = res.body._id;
        assert.deepEqual(res.body.issue_title, "test");
        assert.deepEqual(res.body.issue_text, "test");
        assert.deepEqual(res.body.created_by, "test");
        assert.deepEqual(res.body.assigned_to, "test");
        assert.deepEqual(res.body.status_text, "test");
        done();
      });
  });
  test("only required field", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/testapi")
      .send({
        issue_title: "test",
        issue_text: "test",
        created_by: "test",
        assigned_to: "",
        status_text: "",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.issue_title, "test");
        assert.deepEqual(res.body.issue_text, "test");
        assert.deepEqual(res.body.created_by, "test");
        assert.deepEqual(res.body.assigned_to, "");
        assert.deepEqual(res.body.status_text, "");
        done();
      });
  });
  test("required field missing", function (done) {
    chai
      .request(server)
      .keepOpen()
      .post("/api/issues/apitest")
      .send({
        issue_title: "test",
        issue_text: "test",
        created_by: "",
        assigned_to: "",
        status_text: "",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "required field(s) missing");
        done();
      });
  });
  test("view issues on a project", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.length, 3);
        done();
      });
  });
  test("view issues with one filters", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .query({ _id: "65144e1aaffb20defd70958c" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body[0], {
          _id: "65144e1aaffb20defd70958c",
          issue_title: "hfhfh",
          issue_text: "hh",
          created_by: "ee",
          assigned_to: "",
          status_text: "",
          created_on: "2023-09-27T15:45:30.029Z",
          updated_on: "2023-09-27T15:45:30.029Z",
          open: true,
        });
        done();
      });
  });
  test("view issues with multiple filter", function (done) {
    chai
      .request(server)
      .keepOpen()
      .get("/api/issues/apitest")
      .query({ created_by: "tom", issue_text: "test" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body[0], {
          _id: "651455e3168909160ace0bcb",
          issue_title: "bsbs",
          issue_text: "test",
          created_by: "tom",
          assigned_to: "",
          status_text: "",
          created_on: "2023-09-27T16:18:43.820Z",
          updated_on: "2023-09-27T16:18:43.820Z",
          open: true,
        });
        done();
      });
  });
  test("update one field", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ _id: "65144e15affb20defd709589", issue_text: "changing text" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, "65144e15affb20defd709589");
        done();
      });
  });
  test("update multiple fields", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/api")
      .send({
        _id: "65144e15affb20defd709589",
        issue_text: "changing text again",
        issue_title: "changing title",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully updated");
        assert.equal(res.body._id, "65144e15affb20defd709589");
        done();
      });
  });
  test("update with missing id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({
        _id: "",
        issue_text: "changing text again",
        issue_title: "changing title",
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
  test("update with no field to update", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ _id: "65144e15affb20defd709589", issue_text: "" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "no update field(s) sent");
        assert.equal(res.body._id, "65144e15affb20defd709589");
        done();
      });
  });
  test("update with invalid _id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .put("/api/issues/apitest")
      .send({ _id: "65144e15affb2", issue_text: "test" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not update");
        assert.equal(res.body._id, "65144e15affb2");
        done();
      });
  });
  test("delete an issue", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .send({ _id: id })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.result, "successfully deleted");
        done();
      });
  });
  test("delete an issue with invalid id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .send({ _id: "6514438" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "could not delete");
        assert.equal(res.body._id, "6514438");
        done();
      });
  });
  test("delete an issue with missing id", function (done) {
    chai
      .request(server)
      .keepOpen()
      .delete("/api/issues/apitest")
      .send({ _id: "" })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });
});
