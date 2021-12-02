#!/usr/bin/env node
import yargs, { scriptName } from 'yargs';
import { authenticate } from './app/middlewares/auth';

import * as login from './app/cmds/login';
import * as solutions from './app/cmds/solutions';
import * as templates from './app/cmds/templates';
import { init } from './app/middlewares/init';
import { LogoutCommand } from './app/cmds/logout';
import chalk from 'chalk';

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
  .command(new LogoutCommand())
  .version()
  .help(true)
  .fail((msg, err, args) => {
    // if (err) throw err; // do something with stack report to sentry (maybe)
    console.error(
      chalk.red(
        msg ||
          err.message ||
          'Something went wrong, and we are unable to detect what please contact us for more info'
      )
    );
    console.log('\nUsages:\n');
    console.error(args.help());
    process.exit(1);
  })
  .parse();

export default yargs;
