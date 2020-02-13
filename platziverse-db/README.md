# platziverse-db

## Usage

``` js
const setupDatabase = require('platzi-verse-db')

setupDatabase(config).then(db=>{
    const {Agent, Metric} = db

}).catch(err=> console.error(err))

```

Dependencias:
- sequelize
- pg
- pg-hstore
- debug
- inquirer
- chalk
- ava
- defaults
- sqlite3
- nyc
- sinon (updated: "sinon": "^8.1.1",)
- proxyquire
- longjohn

Comandos
- Corregir errores de codigo: npm run lint -- --fix
