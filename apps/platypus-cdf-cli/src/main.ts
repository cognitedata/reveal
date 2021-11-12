#!/usr/bin/env node
import yargs, { scriptName } from 'yargs';
import { authenticate } from './app/middlewares/auth';

import * as loginCmd from './app/cmds/login';
import * as solutionsCmd from './app/cmds/solutions';
import { init } from './app/middlewares/init';

const config = {
  appId: 'platypus-cli',
};

// commands
scriptName('platypus')
  .config(config)
  .middleware([init, authenticate])
  .demandCommand(1)
  .command(loginCmd)
  .command(solutionsCmd)
  .version()
  .help(true)
  .parse();

export default yargs;
