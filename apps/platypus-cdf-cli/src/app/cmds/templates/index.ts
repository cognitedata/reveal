import { Argv } from 'yargs';
import * as listCmd from './list';
import * as createCmd from './create';
import * as deleteCmd from './delete';
import { TemplateInitCommand } from './init';

export const command = 'templates <command>';
export const desc = 'Manage templates';

export const builder = (yargs: Argv) =>
  yargs
    .command(listCmd)
    .command(createCmd)
    .command(deleteCmd)
    .command(new TemplateInitCommand());

export const handler = () => {
  return;
};
