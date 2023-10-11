import { Argv } from 'yargs';

import * as apiCmds from './api';
import createCmd from './create';
import deleteCmd from './delete';
import generateCmd from './generate';
import listCmd from './list';
import publishCmd from './publish';
import validateCmd from './validate';

export const command = 'data-models <command>';
export const desc = 'Manage data models to store and retrieve data.';
export const aliases = ['dm'];

export const builder = (yargs: Argv) => {
  const cmds = yargs;

  if (process.env.ENABLE_EXPERIMENTAL_CMDS) {
    cmds.command(apiCmds).command(deleteCmd);
  }

  cmds
    .command(createCmd)
    .command(validateCmd)
    .command(publishCmd)
    .command(listCmd)
    .command(deleteCmd)
    .command(generateCmd)
    .demandCommand(1)
    .version(false);

  return cmds;
};

export const handler = () => {
  return;
};
