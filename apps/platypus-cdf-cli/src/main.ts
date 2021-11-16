#!/usr/bin/env node
import yargs, { scriptName } from 'yargs';
import { authenticate } from './app/middlewares/auth';

import * as login from './app/cmds/login';
import * as solutions from './app/cmds/solutions';
import * as templates from './app/cmds/templates';
import { init } from './app/middlewares/init';

const config = {
  appId: 'platypus-cli',
};

// commands
scriptName('platypus')
  .config(config)
  .middleware([init, authenticate])
  .demandCommand(1)
  .command(login)
  .command(solutions)
  .command(templates)
  .version()
  .help(true)
  .parse();

export default yargs;
