import { Argv } from 'yargs';
import * as storageCmds from './storage';
import * as apiCmds from './api';
import createCmd from './create';
import deleteCmd from './delete';
import publishCmd from './publish';
import generateCmd from './generate';
import listCmd from './list';

export const command = 'data-models <command>';
export const desc =
  'Manage data models which allows you to store and retrieve data to your needs.';
export const aliases = ['dm'];

export const builder = (yargs: Argv) => {
  const cmds = yargs;

  if (process.env.ENABLE_EXPERIMENTAL_CMDS) {
    cmds.command(storageCmds).command(apiCmds);
  }

  cmds
    .command(createCmd)
    .command(publishCmd)
    .command(listCmd)
    .command(generateCmd)
    .command(deleteCmd)
    .demandCommand(1)
    .version(false);

  return cmds;
};

export const handler = () => {
  return;
};
