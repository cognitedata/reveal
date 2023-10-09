#!/usr/bin/env node
import {
  PlatypusDmlError,
  PlatypusValidationError,
} from '@platypus/platypus-core';
import * as Sentry from '@sentry/node';
import chalk from 'chalk';
import yargs, { CommandModule, scriptName } from 'yargs';

import * as dataModelsCmds from './app/cmds/data-models';
import logout from './app/cmds/logout';
import * as signin from './app/cmds/sign-in';
import status from './app/cmds/status';
import CONFIG from './app/config/config';
import { CONSTANTS } from './app/constants';
import { authenticate } from './app/middlewares/auth';
import { init } from './app/middlewares/init';
import { DEBUG as _DEBUG } from './app/utils/logger';
import { track } from './app/utils/mixpanel';

const DEBUG = _DEBUG.extend('main');

Sentry.init({
  dsn: CONFIG.SENTRY_DSN,
  tracesSampleRate: 1.0,
});

// commands
scriptName(CONSTANTS.APP_ID)
  .strict()
  .usage(
    `$0 <command>

    The Cognite Data Fusion CLI (CDF CLI) currently supports managing data models. 
    See https://docs.cognite.com/cdf/cli/ for more details.
    For feature requests, navigate to https://hub.cognite.com/.
  `
  )
  .middleware([init, authenticate])
  .version()
  .demandCommand(1)
  .command(signin as CommandModule)
  .command(dataModelsCmds)
  .command(logout)
  .command(status)
  .option('verbose', {
    type: 'boolean',
    alias: 'v',
    default: false,
    describe: 'Show debug messages',
  })
  .option('interactive', {
    type: 'boolean',
    default: true,
    describe:
      'Request for inputs interactively if any required field is missing from options',
  })
  .wrap(Math.min(120, yargs.terminalWidth()))
  .help(true)
  .fail((msg, err, { help }) => {
    let printHelp = false;
    DEBUG(`Error occurred and caught by main handler: ${msg}, ${err}`);

    let errorMessage =
      msg ||
      err.message ||
      'Something went wrong, please contact us for more info';

    if (
      err instanceof PlatypusValidationError &&
      (err as PlatypusValidationError).errors?.length
    ) {
      errorMessage +=
        '\n' +
        (err as PlatypusValidationError).errors
          .map((error) => error.message)
          .join('\n');
    }

    if (err instanceof PlatypusDmlError) {
      errorMessage +=
        '\n' +
        (err as PlatypusDmlError).errors
          .map((error) => {
            const prefix = `[Line: ${error.location.start.line}]:`;
            let msg = `${prefix} ${error.message}`;
            if (error.hint) {
              msg += `\n${' '.repeat(prefix.length + 1)}${error.hint}`;
            }
            return msg;
          })
          .join('\n');
    }

    if (
      errorMessage === 'Not enough non-option arguments: got 0, need at least 1'
    ) {
      errorMessage =
        'You need to enter a valid command. See the list of valid commands below.';
      printHelp = true;
    }
    if (errorMessage.startsWith('Unknown argument')) {
      errorMessage +=
        '. You need to enter a valid command. See the list of valid commands below.';
      printHelp = true;
    }

    console.error(chalk.red(errorMessage));

    Sentry.captureException(err);

    track('CLI.DataModel.ErrorMessage', {
      message: msg || err.message,
    });

    if (printHelp) {
      console.log('\nUsages:\n');
    }
    console.error(help());
    process.exit(1);
  })
  .parse();

export default yargs;
