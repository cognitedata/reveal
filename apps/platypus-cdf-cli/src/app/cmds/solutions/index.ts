import { Argv } from 'yargs';
import generate from './generate';
import deploy from './deploy';
import * as solutionApisCmds from './apis';
import * as solutionApiSpecsCmds from './apiSpec';
import * as storageCmds from './storage';

export const command = 'solutions <command>';
export const desc = 'Manage solutions';
export const aliases = ['s'];

export const builder = (yargs: Argv) => {
  const cmds = yargs.command(generate);

  if (process.env.ENABLE_EXPERIMENTAL_CMDS) {
    cmds
      .command(deploy)
      .command(solutionApisCmds)
      .command(solutionApiSpecsCmds)
      .command(storageCmds);
  }

  cmds.demandCommand(1, 'You need at least one command before moving on');
  return cmds;
};

export const handler = () => {
  return;
};
