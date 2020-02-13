#!/usr/bin/env node

'use strict'

// const minimist = require('minimist')

// console.log('Hello platziverse!');
// const args = minimist(process.argv)
// console.log(args.host);
// console.log(args.name);

const args = require('args')
args
    .option('port', 'The port on wich the app will be running',3000)
    .option('reload', 'Enable/disable livereloading')
    .command('serve', 'Serve your static site', ['s'])

const flags = args.parse(process.argv)