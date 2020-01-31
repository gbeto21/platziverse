"use strict";

const test = require("ava");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

let db = null;
const config = {
  logging: function() {}
};

let MetricStub = {
  belongsTo: sinon.spy()
};

let AgentStub = null;
let sandbox = null;

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create();

  AgentStub = {
    hasMany: sandbox.spy()
  };

  const setupDatabase = proxyquire("../", {
    "./models/agent": () => AgentStub,
    "./models/metric": () => MetricStub
  });
  db = await setupDatabase(config);
});

test.afterEach(() => {
  sandbox && sinon.sandbox.restore();
});

test("Agent ", t => {
  t.truthy(db.Agent, "Agent service should exist");
});

test.serial("Setup", t => {
  t.true(AgentStub.hasMany.called, "AgentModel.hasMany was executed");
  t.true(
    AgentStub.hasMany.calledWith(MetricStub),
    "Argument should be the model"
  );
  t.true(MetricStub.belongsTo.called, "MetricModel.belongsTo was executed");
  t.true(
    MetricStub.belongsTo.calledWith(AgentStub),
    "Argument needs to  be the model."
  );
});
