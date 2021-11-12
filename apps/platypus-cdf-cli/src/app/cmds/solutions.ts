import * as listCmd from './solutions/list';
import * as createCmd from './solutions/create';
import * as deleteCmd from './solutions/delete';
import { Argv } from 'yargs';

export const command = 'solutions <command>';
export const desc = 'Manage solutions';

export const builder = (yargs: Argv) =>
  yargs.command(listCmd).command(createCmd).command(deleteCmd);

export const handler = () => {
  return;
};
