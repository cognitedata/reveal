import versionsListCmd from './list';
import { Argv } from 'yargs';

export const command = 'versions <command>';
export const desc = 'Manage template schema versions';

export const builder = (yargs: Argv) =>
  yargs.command(versionsListCmd).demandCommand();

export const handler = () => {
  return;
};
