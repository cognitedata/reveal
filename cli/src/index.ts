#!/usr/bin/env node
import yargs, { scriptName } from 'yargs';
import { authenticate } from './middlewares/auth';
import { Config, silentlyReadConfigFile } from './config';
import { commandDirOptions } from './utils/commandDirOptions';

const config = silentlyReadConfigFile() as Config;

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
  .commandDir('cmds', commandDirOptions)
  .version()
  .help(true)
  .parse();

export default yargs;
