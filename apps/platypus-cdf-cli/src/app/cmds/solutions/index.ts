import { Argv } from 'yargs';
import generate from './generate';

export const command = 'solutions <command>';
export const desc = 'Manage solutions';

export const builder = (yargs: Argv) => yargs.command(generate);

export const handler = () => {
  return;
};
