#!/usr/bin/env node
import yargs, { scriptName } from 'yargs';
import { authenticate } from './lib/middlewares/auth';
import { Config, silentlyReadConfigFile } from './lib/config';
import { commandDirOptions } from './lib/utils/commandDirOptions';

// const config = silentlyReadConfigFile() as Config;
const config = {
  projectId: 'a32dc0cc1-c506-422c-8da4-2f8994b2e9ca',
  projectName: 'platypus-cli',
  cdfTenant: 'cognite',
};

scriptName('platypus')
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
  .commandDir('lib/cmds', commandDirOptions)
  .version()
  .help(true)
  .parse();

export default yargs;
