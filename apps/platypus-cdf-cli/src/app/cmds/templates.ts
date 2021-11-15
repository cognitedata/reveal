import * as listCmd from './templates/list';
import * as createCmd from './templates/create';
import * as deleteCmd from './templates/delete';
import { Argv } from 'yargs';

export const command = 'templates <command>';
export const desc = 'Manage templates';

export const builder = (yargs: Argv) =>
  yargs.command(listCmd).command(createCmd).command(deleteCmd);

export const handler = () => {
  return;
};
