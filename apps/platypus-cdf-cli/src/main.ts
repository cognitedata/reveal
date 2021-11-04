#!/usr/bin/env node
import yargs, { scriptName } from 'yargs';
import { authenticate } from './app/middlewares/auth';

import * as loginCmd from './app/cmds/login';
import * as solutionsCmd from './app/cmds/solutions';

// const config = silentlyReadConfigFile() as Config;
const config = {
  projectId: 'a32dc0cc1-c506-422c-8da4-2f8994b2e9ca',
  projectName: 'platypus-cli',
  cdfTenant: 'cognite',
};

let cli = scriptName('platypus')
  .config(config)
  .middleware(authenticate)
  .demandCommand(1)
  .option({
    'api-key': {
      default: process.env.COGNITE_CREDENTIALS,
      defaultDescription: '$COGNITE_CREDENTIALS',
    },
    'base-url': {
      default: 'https://platypus.staging.cogniteapp.com',
    },
  })
  .version()
  .help(true);

cli = cli.command(
  loginCmd.command,
  loginCmd.desc,
  loginCmd.builder as any,
  loginCmd.handler
);
cli = cli.command(
  solutionsCmd.command,
  solutionsCmd.desc,
  solutionsCmd.builder as any,
  solutionsCmd.handler
);
cli.parse();

export default cli;
