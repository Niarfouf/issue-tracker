"use strict";
const mongoose = require("mongoose");
module.exports = function (app) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const Schema = mongoose.Schema;
  const projectsSchema = new Schema({
    name: { type: String, required: true, unique: true },
  });
  const Project = mongoose.model("Project", projectsSchema);
  const issuesSchema = new Schema({
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: { type: String },
    status_text: { type: String },
    created_on: { type: Date, required: true },
    updated_on: { type: Date, required: true },
    open: { type: Boolean, required: true, default: true },
    project_id: { type: String },
  });
  issuesSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.project_id;
    delete obj.__v;
    return obj;
  };
  const Issue = mongoose.model("Issue", issuesSchema);
  app
    .route("/api/issues/:project")

    .get(async function (req, res) {
      let project = req.params.project;
      let queries = req.query;
      try {
        let foundProject = await Project.find({ name: project });
        let projectId = foundProject[0]._id;
        queries["project_id"] = projectId;
        let foundIssues = await Issue.find(queries);
        res.json(foundIssues);
      } catch (error) {
        res.json({ error: "problem searching database" });
      }
    })

    .post(async function (req, res) {
      let project = req.params.project;
      let { issue_title, issue_text, created_by, assigned_to, status_text } =
        req.body;
      if (!assigned_to) {
        assigned_to = "";
      }
      if (!status_text) {
        status_text = "";
      }
      let createdOn = new Date();
      try {
        let checkProject = await Project.find({ name: project });
        if (checkProject.length === 0) {
          let newProject = new Project({ name: project });
          await newProject.save();
          checkProject = await Project.find({ name: project });
        }
        let newIssue = new Issue({
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          created_on: createdOn,
          updated_on: createdOn,
          project_id: checkProject[0]._id,
        });
        let newCreatedIssue = await newIssue.save();
        res.json(newCreatedIssue);
      } catch (error) {
        res.json({ error: "required field(s) missing" });
      }
    })

    .put(async function (req, res) {
      let project = req.params.project;
      let {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;
      let testArray = [
        ["issue_title", issue_title],
        ["issue_text", issue_text],
        ["created_by", created_by],
        ["assigned_to", assigned_to],
        ["status_text", status_text],
        ["open", open],
      ];
      let emptyTest = true;
      let update = {};
      testArray.forEach((e) => {
        if (e[1]) {
          emptyTest = false;
          update[e[0]] = e[1];
        }
      });
      if (!_id) {
        return res.json({ error: "missing _id" });
      }
      if (emptyTest) {
        return res.json({ error: "no update field(s) sent", _id: _id });
      }
      update["updated_on"] = new Date();
      try {
        let success = await Issue.findOneAndUpdate({ _id: _id }, update);
        if (success) {
          res.json({ result: "successfully updated", _id: _id });
        } else {
          res.json({ error: "could not update", _id: _id });
        }
      } catch (error) {
        res.json({ error: "could not update", _id: _id });
      }
    })

    .delete(async function (req, res) {
      let project = req.params.project;
      let _id = req.body._id;
      if (!_id) {
        return res.json({ error: "missing _id" });
      }
      try {
        let isDeleted = await Issue.findByIdAndRemove(_id);
        if (isDeleted) {
          res.json({ result: "successfully deleted", _id: _id });
        } else {
          res.json({ error: "could not delete", _id: _id });
        }
      } catch (error) {
        res.json({ error: "could not delete", _id: _id });
      }
    });
};
