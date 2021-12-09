import { Argv } from 'yargs';
import * as versionsCmd from './versions';
import publishCmd from './publish';

export const command = 'schema <command>';
export const desc = 'Manages templates schemas';

export const builder = (yargs: Argv) =>
  yargs.command(versionsCmd).command(publishCmd).demandCommand();

export const handler = () => {
  return;
};
