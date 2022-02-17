import { Argv } from 'yargs';
import generate from './generate';
import * as solutionApiCmds from './api';

export const command = 'solutions <command>';
export const desc = 'Manage solutions';
export const aliases = ['s'];

export const builder = (yargs: Argv) => {
  const cmds = yargs.command(generate);

  if (process.env.ENABLE_EXPERIMENTAL_CMDS) {
    cmds.command(solutionApiCmds);
  }

  cmds.demandCommand(1);
  return cmds;
};

export const handler = () => {
  return;
};
