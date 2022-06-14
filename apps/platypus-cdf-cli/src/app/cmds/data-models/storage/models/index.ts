import { Argv } from 'yargs';
import listStorageCmd from './list';
import applyStorageCmd from './apply';
import deleteStorageCmd from './delete';

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
