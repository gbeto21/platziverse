"use strict";

const debug = require("debug")("platziverse:mqtt");
const mosca = require("mosca");
const redis = require("redis");
const chalk = require("chalk");
const db = require("platziverse-db");
const { parsePayload } = require("./utils");

const backend = {
  type: "redis",
  redis,
  return_buffers: true
};

const settings = {
  port: 1883,
  backend
};

const config = {
  database: process.env.DB_NAME || "platziverse",
  username: process.env.DB_USER || "platzi",
  password: process.env.DB_PASS || "platzi",
  host: process.env.DB_HOST || "localhost",
  dialect: "postgres",
  loggin: s => debug(s)
};

const server = new mosca.Server(settings);
const clients = new Map();

let Agent, Metric;

server.on("clientConnected", client => {
  debug(`<-----Client Connected----->: ${client.id}`);
  clients.set(client.id, null);
  debug(`<-----Clients saved----->: ${clients}`);
});

server.on("clientDisconnected", async (client) => {
  debug(`1. Client Disconnected: ${client.id}`);

  const agent = clients.get(client.id);
  debug(`2. Agent fountd: ${agent}`);

  if (agent) {
    agent.connected = false;
    try {
      debug(`3. Call upate agent`);
      await Agent.createOrUpdate(agent);
    } catch (error) {
      debug(`4. Catch error`);
      return handleError(error);
    }

    //Delete agent from clients list
    clients.delete(client.id);

    debug(`5. Call publish`);
    server.publish({
      topic: "agent/disconnected",
      payload: JSON.stringify({
        agent: {
          uuid: agent.uuid
        }
      })
    });

    debug(
      `Client (${clientid}) associated to Agent (${agent.uuid}) market as disconnected`
    );
  }
});

server.on("published", async (packet, client) => {
  debug(`Received: ${packet.topic}`);

  switch (packet.topic) {
    case "agent/connected":
    case "agent/disconnected":
      debug(`Payload: ${packet.payload}`);
      break;
    case "agent/message":
      debug(`Payload: ${packet.payload}`);
      const payload = parsePayload(packet.payload);

      if (payload) {
        payload.agent.connected = true;

        let agent;
        try {
          agent = await Agent.createOrUpdate(payload.agent);
          debug(`***-> Agent created or updated: ${agent}<-***`);
        } catch (error) {
          return handleError(error);
        }

        debug(`Agent ${agent.uuid} saved`);

        // Notify Agent is Connected
        if (!clients.get(client.id)) {
          clients.set(client.id, agent);

          server.publish({
            topic: "agent/connected",
            payload: JSON.stringify({
              agent: {
                uuid: agent.uuid,
                name: agent.name,
                hostname: agent.hostname,
                pid: agent.pid,
                connected: agent.connected
              }
            })
          });
        }

        //Store metrics
        for (let metric of payload.metrics) {
          let m;
          try {
            m = await Metric.create(agent.uuid, metric);
          } catch (error) {
            return handleError(error);
          }

          debug(`Metric ${m.id} saved on agent ${agent.uuid}`);
        }
      }

      break;
  }
});

server.on("ready", async () => {
  const services = await db(config).catch(handleFatalError);

  Agent = services.Agent;
  Metric = services.Metric;

  console.log(`${chalk.green("[platziverse-mqtt]")} server is running`);
});

server.on("error", handleFatalError);

function handleFatalError(err) {
  console.error(`${chalk.red("[fatal error]")} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

function handleError(err) {
  console.error(`${chalk.red("[fatal error]")} ${err.message}`);
  console.error(err.stack);
}

process.on("uncaughtException", handleFatalError);
process.on("unhandledRejection", handleFatalError);