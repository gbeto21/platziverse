"use strict";

const test = require("ava");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const agentFixtures = require("./fixtures/agent");
const metricFixtures = require("./fixtures/metric");

let db = null;
const config = {
  logging: function() {}
};

const MetricStub = {
  belongsTo: sinon.spy()
};

const single = Object.assign({}, agentFixtures.single);
const id = 1;
const uuid = "yyy-yyy-yyy";
let AgentStub = null;
let sandbox = null;
const type = "scanner";

const connectedArgs = {
  where: { connected: true }
};

const usernameArgs = {
  where: { username: "platzi", connected: true }
};

const uuidArgs = {
  where: {
    uuid
  }
};

const newAgent = {
  uuid: "123-123-123",
  name: "test",
  username: "test",
  hostname: "test",
  pid: 0,
  connected: false
};

const newMetric = {
  id: 5,
  agentId: 1,
  type: "type",
  value: "5ft",
  createdAt: new Date(),
  updatedAt: new Date()
};

const typeArgs = {
  where: { type: "type" }
};

const findAllUuidMetric = {
  attributes: ["type"], // Para seleccionar ese atributo específico que quiero retornar
  group: ["type"], // Lo agrupamos por type
  include: [
    {
      // Con include hacemos los join o la relación con la tabla
      atrributes: [],
      model: AgentStub, // La tabla o modelo con quien voya a relacionarlo o hacer el join
      where: {
        // Especificamos la uuid
        uuid
      }
    }
  ],
  query: {
    raw: true // Que los query sean de tipo row es decir que me devuelvan objetos simples, la información en JSON()
  }
};

const findAllUuidTypeMetric = {
  atrributes: ["id", "type", "value", "createdAt"],
  group: ["type"],
  where: {
    // filtro de búsqueda
    type
  },
  limit: 20, // Límite de registros que quiero que me muestre
  order: [["createdAt", "DESC"]], // Me muestre el registro por orden 'campode fecha' createdAt
  include: [
    {
      attributes: [],
      model: AgentStub,
      where: {
        // filtro de búsqueda
        uuid
      }
    }
  ],
  query: {
    raw: true
  }
};

test.beforeEach(async () => {
  sandbox = sinon.sandbox.create();

  AgentStub = {
    hasMany: sandbox.spy()
  };

  // Model create Stub
  AgentStub.create = sandbox.stub();
  AgentStub.create.withArgs(newAgent).returns(
    Promise.resolve({
      toJSON() {
        return newAgent;
      }
    })
  );

  //Model create metric
  MetricStub.create = sandbox.stub();
  MetricStub.create.withArgs(newMetric).returns(
    Promise.resolve({
      toJSON() {
        return newMetric;
      }
    })
  );

  //Model find byAgentuuid Stub
  MetricStub.getByAgenteUuid = sandbox.stub();
  MetricStub.getByAgenteUuid
    .withArgs(uuid)
    .returns(Promise.resolve(metricFixtures.getByAgenteUuid(uuid)));

  //Model find by AgentId Stub
  MetricStub.getByAgenteType = sandbox.stub();
  MetricStub.getByAgenteType
    .withArgs(typeArgs)
    .returns(Promise.resolve(metricFixtures.getByAgenteType(typeArgs)));

  // Model findOne Stub
  AgentStub.findOne = sandbox.stub();
  AgentStub.findOne
    .withArgs(uuidArgs)
    .returns(Promise.resolve(agentFixtures.byUuid(uuid)));

  // Model findById Stub
  AgentStub.findById = sandbox.stub();
  AgentStub.findById
    .withArgs(id)
    .returns(Promise.resolve(agentFixtures.byId(id)));

  // Model update Stub
  AgentStub.update = sandbox.stub();
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single));

  // Model findAll Stub
  AgentStub.findAll = sandbox.stub();
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all));
  AgentStub.findAll
    .withArgs(connectedArgs)
    .returns(Promise.resolve(agentFixtures.connected));
  AgentStub.findAll
    .withArgs(usernameArgs)
    .returns(Promise.resolve(agentFixtures.platzi));

  // Model metric stub findAll
  MetricStub.findAll = sandbox.stub();
  MetricStub.findAll
    .withArgs(findAllUuidMetric)
    .returns(Promise.resolve(metricFixtures.getByAgenteUuid(uuid)));
  MetricStub.findAll
    .withArgs(findAllUuidTypeMetric)
    .returns(Promise.resolve(metricFixtures.getByAgenteType(type, uuid)));

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
  const agent = await db.Agent.findById(id);

  t.true(AgentStub.findById.called, "findById shold be called on model");
  t.true(AgentStub.findById.calledOnce, "findById should be called once");
  t.true(
    AgentStub.findById.calledWith(id),
    "findById shold be called with specidified id"
  );

  t.deepEqual(agent, agentFixtures.byId(id), "should be the same");
});

test.serial("Agent#findByUuid", async t => {
  const agent = await db.Agent.findByUuid(uuid);

  t.true(AgentStub.findOne.called, "findOne should be called on model");
  t.true(AgentStub.findOne.calledOnce, "findOne should be called once");
  t.true(
    AgentStub.findOne.calledWith(uuidArgs),
    "findOne should be called with uuid args"
  );

  t.deepEqual(agent, agentFixtures.byUuid(uuid), "agent should be the same");
});

test.serial("Agent#findAll", async t => {
  const agents = await db.Agent.findAll();

  t.true(AgentStub.findAll.called, "findAll should be called on model");
  t.true(AgentStub.findAll.calledOnce, "findAll should be called once");
  t.true(
    AgentStub.findAll.calledWith(),
    "findAll should be called without args"
  );

  t.is(
    agents.length,
    agentFixtures.all.length,
    "agents should be the same amount"
  );
  t.deepEqual(agents, agentFixtures.all, "agents should be the same");
});

test.serial("Agent#findConnected", async t => {
  const agents = await db.Agent.findConnected();

  t.true(AgentStub.findAll.called, "findAll should be called on model");
  t.true(AgentStub.findAll.calledOnce, "findAll shold be called once");
  t.true(
    AgentStub.findAll.calledWith(connectedArgs),
    "findAll should be called whit connected args"
  );

  t.is(
    agents.length,
    agentFixtures.connected.length,
    "agents should be the same amount"
  );
  t.deepEqual(agents, agentFixtures.connected, "agents should be the same");
});

test.serial("Agent#findByUsername", async t => {
  const agents = await db.Agent.findByUsername("platzi");

  t.true(AgentStub.findAll.called, "findAll should be called on model");
  t.true(AgentStub.findAll.calledOnce, "findAll should be called once");
  t.true(
    AgentStub.findAll.calledWith(usernameArgs),
    "findAll should be called with user name args"
  );

  t.is(
    agents.length,
    agentFixtures.platzi.length,
    "agents should be the same amount"
  );
  t.deepEqual(agents, agentFixtures.platzi, "agents should be the same");
});

test.serial("Agent#createOrUpdate - exist", async t => {
  const agent = await db.Agent.createOrUpdate(single);
  t.true(AgentStub.findOne.called, "findOne should be called on model");
  t.true(AgentStub.findOne.calledTwice, "findOne should be called twice");
  t.true(AgentStub.update.calledOnce, "update should be called once");

  t.deepEqual(agent, single, "agent should be the same");
});

test.serial("Agent#createOrUpdate - new", async t => {
  const agent = await db.Agent.createOrUpdate(newAgent);

  t.true(AgentStub.findOne.called, "findOne should be called on model");
  t.true(AgentStub.findOne.calledOnce, "findOne should be called once");
  t.true(
    AgentStub.findOne.calledWith({ where: { uuid: newAgent.uuid } }),
    "findOne should be called with uuid args"
  );
  t.true(AgentStub.create.called, "create should be called on model");
  t.true(AgentStub.create.calledOnce, "create should be called once");
  t.true(
    AgentStub.create.calledWith(newAgent),
    "create should be called with specified args"
  );

  t.deepEqual(agent, newAgent, "agent should be the same");
});

test.serial("Metric#createOr-Update - new", async t => {
  const metric = await db.Metric.create(uuid, newMetric);

  t.true(MetricStub.create.called, "create should be called on model");
  t.true(MetricStub.create.calledOnce, "create should be called once");
  t.true(
    MetricStub.create.calledWith(newMetric),
    "create should be called with specified newMetric args"
  );

  t.deepEqual(metric, newMetric, "metric should be the same");
});

test.serial("Metric#getByAgentUuid", async t => {
  const metric = await db.Metric.getByAgenteUuid(uuid);

  t.true(
    MetricStub.findAll.called,
    "getByAgenteUuid should be called on model"
  );
  t.true(MetricStub.findAll.calledOnce, "findAll should be called once");
  // t.true(MetricStub.findAll.calledWith(findAllUuidMetric), 'No se llamo al metodo con los parametros especificados')

  // t.deepEqual(metric, metricFixtures.getByAgenteUuid(type,uuid))
});
