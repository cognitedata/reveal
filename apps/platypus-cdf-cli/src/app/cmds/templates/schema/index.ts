import { Argv } from 'yargs';
import * as versionsCmd from './versions';
import publishCmd from './publish';
import pull from './pull';

export const command = 'schema <command>';
export const desc = 'Manages templates schemas';

export const builder = (yargs: Argv) =>
  yargs.command(versionsCmd).command(publishCmd).command(pull).demandCommand(1);

export const handler = () => {
  return;
};
