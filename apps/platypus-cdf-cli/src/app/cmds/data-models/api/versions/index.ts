import { Argv } from 'yargs';

import versionsListCmd from './list';
import publishCmd from './publish';

export const command = 'versions <command>';
export const desc = 'Manage Api schema versions';

export const builder = (yargs: Argv) =>
  yargs.command(versionsListCmd).command(publishCmd).demandCommand(1);

export const handler = () => {
  return;
};
