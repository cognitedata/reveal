import versionsListCmd from './list';
import publishCmd from './publish';
import { Argv } from 'yargs';

export const command = 'versions <command>';
export const desc = 'Manage Api schema versions';

export const builder = (yargs: Argv) =>
  yargs.command(versionsListCmd).command(publishCmd).demandCommand(1);

export const handler = () => {
  return;
};
