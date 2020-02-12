"use strict";

const debug = require("debug")("platziverse:web");
const http = require("http");
const path = require("path");
const express = require("express");
const chalk = require("chalk");
const socketio = require("socket.io");
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8080;
const io = socketio(server);
const PlatziverseAgent = require("platziverse-agent");
const agent = new PlatziverseAgent();
const { pipe } = require("./utils");

app.use(express.static(path.join(__dirname, "public")));

io.on("connect", socket => {
  debug(`Connected ${socket.id}`);

  pipe(agent, socket);
});

function handleFatalError(err) {
  console.error(`${chalk.red("[Fatal error]")} ${err.message}`);
  console.error(err.stack);
  process.exit(1);
}

process.on("uncaughtException", handleFatalError);
process.on("unhandledRejection", handleFatalError);

server.listen(port, () => {
  console.log(
    `${chalk.green("[platziverse-web]")} server listening on port ${port}`
  );

  agent.connect();
});
