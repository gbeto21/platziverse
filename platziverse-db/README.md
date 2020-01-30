# platziverse-db

## Usage

``` js
const setupDatabase = require('platzi-verse-db')

setupDatabase(config).then(db=>{
    const {Agent, Metric} = db

}).catch(err=> console.error(err))

```