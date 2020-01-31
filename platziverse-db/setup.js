'use strict'

const debug = require('debug')('platziverse:db:setup')
const db = require('./')

async function setup () {
  const config = {
    database: process.env.DB_NAME || 'platziverse',
    username: process.env.DB_USER || 'platzi',
    password: process.env.DB_PASS || 'platzi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    loggin: s => debug(s),
    setup: true
  }

  await db(config).catch(handleFatalError)

  console.log('Succes')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stac)
  process.exit(1)
}

setup()
