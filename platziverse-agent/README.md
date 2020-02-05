# platziverse-agent

## Usage

```js
const PlatziverseAgent = require("platziverse-agent");

const agent = new PlatziverseAgent({
  interval: 2000
});

agent.connect();

// This agent only
agent.on('connected')
agent.on('disconnected')
agent.on('message')

agent.on('aguent/connected')
agent.on('aguent/disconnected')
agent.on("agent/message", payload => {
  console.log(payload);
});

setTimeout(() => agent.disconnect(), 20000);
```

dependencies:
- mqtt
- debug
- defaults
- uuid