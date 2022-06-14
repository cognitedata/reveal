import { Argv } from 'yargs';
// import generate from './generate';
// import * as solutionApiCmds from './api';
import * as storageCmds from './storage';
import * as apiCmds from './api';

export const command = 'data-models <command>';
export const desc = 'Manage Data Models';
export const aliases = ['dm'];

export const builder = (yargs: Argv) => {
  const cmds = yargs;

  if (process.env.ENABLE_EXPERIMENTAL_CMDS) {
    cmds.command(storageCmds).command(apiCmds);
  }

  cmds.demandCommand(1);
  return cmds;
};

export const handler = () => {
  return;
};
