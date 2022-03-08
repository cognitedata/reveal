#!/usr/bin/env node
import yargs, { scriptName } from 'yargs';
import chalk from 'chalk';
import { authenticate } from './app/middlewares/auth';
import * as login from './app/cmds/login';
import * as solutions from './app/cmds/solutions';
import * as templates from './app/cmds/templates';
import { init } from './app/middlewares/init';
import status from './app/cmds/status';
import logout from './app/cmds/logout';
import initCmd from './app/cmds/init';
import { DEBUG as _DEBUG } from './app/utils/logger';
import { CONSTANTS } from './app/constants';
import { getCompleteCommandString } from './app/utils/yargs-utils';

const DEBUG = _DEBUG.extend('main');

// commands
scriptName(CONSTANTS.APP_ID)
  .strict()
  .middleware([init, authenticate])
  .demandCommand(1)
  .command(login)
  .command(solutions)
  .command(templates)
  .command(logout)
  .command(status)
  .command(initCmd)
  .option('verbose', {
    type: 'boolean',
    alias: 'v',
    default: false,
    describe: 'Show debug messages',
  })
  .option('interactive', {
    type: 'boolean',
    default: true,
    describe: 'Show prompts and ask for user inputs',
  })
  .version()
  .help(true)
  .fail((msg, err, { argv, help }) => {
    DEBUG(`Error occurred and caught by main handler: ${msg}, ${err}`);
    // if (err) throw err; // do something with stack report to sentry (maybe)
    console.error(
      chalk.red(
        msg ||
          err.message ||
          'Something went wrong, and we are unable to detect what please contact us for more info'
      )
    );

    argv?.mixpanel.track(getCompleteCommandString(argv), { failed: true });

    console.log('\nUsages:\n');
    console.error(help());
    process.exit(1);
  })
  .parse();

export default yargs;
