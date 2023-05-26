import { Argv } from 'yargs';

import * as modelsCmds from './models';
import * as nodeCmds from './nodes';
import * as spacesCmds from './spaces';

export const command = 'storage <command>';
export const desc = 'Manage data model storage';

export const builder = (yargs: Argv) => {
  const cmds = yargs
    .command(modelsCmds)
    .command(spacesCmds)
    .command(nodeCmds)
    .demandCommand(1);
  return cmds;
};

export const handler = () => {
  return;
};
