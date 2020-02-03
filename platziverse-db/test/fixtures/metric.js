"use strict";

const agentFixture = require("./agent");

const metric = {
  id: 1,
  agentId: 1,
  type: "type",
  value: "fist",
  createdAt: new Date(),
  updatedAt: new Date()
};

const metrics = [
  metric,
  newMetric(metric, {
    id: 2,
    agentId: 1,
    value: "second",
    type: "tipo"
  }),
  newMetric(metric, {
    id: 3,
    agentId: 2,
    value: "tercero",
    type: "anhoter type"
  }),
  newMetric(metric, {
    id: 4,
    agentId: 2,
    value: "cuarto",
    type: "other type"
  })
];

function newMetric(obj, values) {
  const metric = Object.assign({}, obj);
  return Object.assign(metric, values);
}

function getByAgenteUuid(uuid) {
  let agentFound = agentDB.byUuid(uuid);

  if (!agentFound) {
    return null;
  }

  return metrics.filter(met => met.agentId === agentFound.id);
}

function getByAgenteType(type, uuid) {
  let agentFound = agentDB.byUuid(uuid);

  if (!agentFound) {
    return null;
  }

  return metrics.filter(met => met.type === agentFound.type);
}

module.exports = {
  single: metric,
  all: metrics,
  getByAgenteUuid: uuid => {
    const type = metrics
      .filter(a => a.agentId === agentFixture.byUuid(uuid).id)
      .map(m => m.type);
    return type.filter((elem, pos) => type.indexOf(elem) === pos); // 'elem' es cada uno de los elementos del array // 'pos' es la posición del array de cada elemento [0,1,2]
  },
  getByAgenteType: (type, uuid) =>
    metrics.filter(
      a => a.type === type && a.agentId === agentFixture.byUuid(uuid).id
    )
};
