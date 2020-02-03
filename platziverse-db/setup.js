"use strict";

const debug = require("debug")("platziverse:db:setup");
const inquirer = require("inquirer");
const chalk = require("chalk");
const db = require("./");

const prompt = inquirer.createPromptModule();

async function setup() {
  const flagYes = process.argv.indexOf("yes");

  if (flagYes) {
    deleteDataBase();
  } else {
    const answer = await prompt([
      {
        type: "confirm",
        name: "setup",
        message: "This will destroy the database, Are your sure? "
      }
    ]);

    if (!answer.setup) {
      return console.log("Nothing happened :) ");
    }

    deleteDataBase();
  }
}

async function deleteDataBase() {
  const config = {
    database: process.env.DB_NAME || "platziverse",
    username: process.env.DB_USER || "platzi",
    password: process.env.DB_PASS || "platzi",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres",
    loggin: s => debug(s),
    setup: true
  };

  await db(config).catch(handleFatalError);

  console.log("Succes");
  process.exit(0);
}

function handleFatalError(err) {
  console.error(`${chalk.red("[fatal error]")} ${err.message}`);
  console.error(err.stac);
  process.exit(1);
}

setup();
