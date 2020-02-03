# platzi-verse-mqtt

## `agent/conected`

```js
{
  agent: {
    uuid, //auto generado
      username, //definir por configuracion
      name, //definir por configuracion
      hostname, //obtener del sistema operativo
      pid; //obtener del proceso
  }
}
```

## `agent/disconnected`

```js
{
  agent: {
    uuid;
  }
}
```

## `agent/message`

```js
{
    agent,
    metrics:[
        {
            type,
            value
        }
    ],
    timestamp //generar caundo creamos el mensaje
}
```
