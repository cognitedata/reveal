import versionsListCmd from './list';
import createCmd from './create';
import { Argv } from 'yargs';

export const command = 'versions <command>';
export const desc = 'Manage ApiSpec schema versions';

export const builder = (yargs: Argv) =>
  yargs.command(versionsListCmd).command(createCmd).demandCommand(1);

export const handler = () => {
  return;
};
