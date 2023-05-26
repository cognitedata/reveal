import { Argv } from 'yargs';

import applyStorageCmd from './apply';
import deleteStorageCmd from './delete';
import listStorageCmd from './list';

export const command = 'models <command>';
export const desc = 'Manage data model storage models';

export const builder = (yargs: Argv) => {
  const cmds = yargs
    .command(listStorageCmd)
    .command(applyStorageCmd)
    .command(deleteStorageCmd);

  cmds.demandCommand(1);
  return cmds;
};

export const handler = () => {
  return;
};
