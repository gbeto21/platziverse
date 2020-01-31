"use strict";

const test = require("ava");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const agentFixtures = require("./fixtures/agent");

let db = null;
const config = {
  logging: function() {}
};

let MetricStub = {
  belongsTo: sinon.spy()
};

let single = Object.assign({}, agentFixtures.single);
let id = 1;
let uuid = "yyy-yyy-yyy";
let AgentStub = null;
let sandbox = null;

let uuidArgs = {
  where: {
    uuid
  }
};

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create();

  AgentStub = {
    hasMany: sandbox.spy()
  };

  //Model findOne Stub
  AgentStub.findOne = sandbox.stub();
  AgentStub.findOne
    .withArgs(uuidArgs)
    .returns(Promise.resolve(agentFixtures.byUuuid(uuid)));

  // Model findById Stub
  AgentStub.findById = sandbox.stub();
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)));

  //Model update Stub
  AgentStub.update = sandbox.stub();
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single));

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

test.serial("Agent#findById", async t => {
  let agent = await db.Agent.findById(id);

  t.true(AgentStub.findById.called, "findById shold be called on model");
  t.true(AgentStub.findById.calledOnce, "findById should be called once");
  t.true(
    AgentStub.findById.calledWith(id),
    "findById shold be called with specidified id"
  );

  t.deepEqual(agent, agentFixtures.byId(id), "should be the same");
});

test.serial("Agent#createOrUpdate - exist", async t => {
  let agent = await db.Agent.createOrUpdate(single);
  t.true(AgentStub.findOne.called, "findOne should be called on model");
  t.true(AgentStub.findOne.calledTwice, "findOne should be called twice");
  t.true(AgentStub.update.calledOnce, "update should be called once");
  
  t.deepEqual(agent, single, "agent should be the same");
});
