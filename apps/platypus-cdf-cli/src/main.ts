#!/usr/bin/env node
import yargs, { scriptName } from 'yargs';
import { authenticate } from './app/middlewares/auth';

import * as loginCmd from './app/cmds/login';
import * as solutionsCmd from './app/cmds/solutions';
import { init } from './app/middlewares/init';

const config = {
  appId: 'platypus-cli',
};

let cli = scriptName('platypus')
  .config(config)
  .middleware([init, authenticate])
  .demandCommand(1)
  .version()
  .help(true);

cli = cli.command(
  loginCmd.command,
  loginCmd.desc,
  loginCmd.builder,
  loginCmd.handler
);
cli = cli.command(
  solutionsCmd.command,
  solutionsCmd.desc,
  solutionsCmd.builder,
  solutionsCmd.handler
);
cli.parse();

export default cli;
