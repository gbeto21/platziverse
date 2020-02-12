"use strict";

const debug = require("debug")("platziverse:api:routes");
const express = require("express");
const db = require("platziverse-db");
const config = require("./config");
const auth = require("express-jwt");
const guard = require("express-jwt-permissions")()
const asyncify = require("express-asyncify");
const api = asyncify(express.Router());
let services, Agent, Metric;

api.use("*", async (req, res, next) => {
  if (!services) {
    debug("Connectin to database");
    try {
      services = await db(config.db);
    } catch (error) {
      return next(error);
    }
    Agent = services.Agent;
    Metric = services.Metric;
  }
  next();
});

api.get("/agents", auth(config.auth), async (req, res, next) => {
  debug("A request has come to /agent");

  const { user } = req;
  if (!user || !user.username) {
    return next(new Error("Not authorized"));
  }

  let agents = [];

  try {
    if (user.admin) agents = await Agent.findConnected();
    else agents = await Agent.findByUsername(user.username);
  } catch (error) {
    return next(error);
  }

  res.send(agents);
});
api.get("/agent/:uuid", async (req, res, next) => {
  const { uuid } = req.params;

  debug(`request to /aent/${uuid}`);

  let agent;
  try {
    agent = await Agent.findByUuid(uuid);
  } catch (error) {
    return next(error);
  }

  if (!agent) {
    return next(new Error(`Agent not found with uuid ${uuid}.`));
  }
  res.send(agent);
});

api.get(
  "/metrics/:uuid",
  auth(config.auth),
  guard.check(["metric:read"]),
  async (req, res, next) => {
    const { uuid } = req.params;

    debug(`request to /metrics/${uuid}`);

    let metrics = [];

    try {
      metrics = await Metric.getByAgenteUuid(uuid);
    } catch (error) {
      next(error);
    }

    if (!metrics || metrics.length === 0) {
      return next(new Error(`Metrics not found for agent with uuid ${uuid}`));
    }

    res.send(metrics);
  }
);

api.get("/metrics/:uuid/:type", async (req, res, next) => {
  const { uuid, type } = req.params;

  debug(`request to /metrics/${uuid}/${type}`);
  let metrics = [];
  try {
    metrics = await Metric.getByAgenteType(type, uuid);
  } catch (error) {
    return next(error);
  }
  if (!metrics || metrics.length === 0) {
    return next(
      new Error(`Metrics (${type}) not found for agent with uuid ${uuid}`)
    );
  }

  res.send(metrics);
});

module.exports = api;
