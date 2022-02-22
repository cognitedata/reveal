import { Argv } from 'yargs';
import listCmd from './list';
import createCmd from './create';
import deleteCmd from './delete';
import * as schemaCmds from './schema';
import generate from './generate';

export const command = 'templates <command>';
export const desc = 'Manage templates';
export const aliases = ['t'];

export const builder = (yargs: Argv) =>
  yargs
    .command(listCmd)
    .command(createCmd)
    .command(deleteCmd)
    .command(schemaCmds)
    .command(generate)
    .demandCommand(1, 'need one valid sub command');

export const handler = () => {
  return;
};
