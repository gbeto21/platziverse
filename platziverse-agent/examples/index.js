const PlatziverseAgent = require("../");

const agent = new PlatziverseAgent({
  name: "myapp",
  username: "admin",
  interval: 2000
});

agent.addMetric("rss", function getRss() {
  return process.memoryUsage().rss;
});

agent.addMetric("promiseMetric", function getRandomPromise() {
  return Promise.resolve(Math.random());
});

agent.addMetric("callbackMetric", function getRandomCallback(callback) {
  setTimeout(() => {
    callback(null, Math.random());
  }, 10000);
});

agent.connect();

// This agent only
agent.on("connected", handler);
agent.on("disconnected", handler);
agent.on("message", handler);

//Other agents
agent.on("aguent/connected", handler);
agent.on("aguent/disconnected", handler);
agent.on("agent/message", payload => {
  console.log(payload);
});

function handler(payload) {
  console.log(payload);
}

setTimeout(() => agent.disconnect(), 20000);
