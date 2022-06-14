import { Argv } from 'yargs';
import listApisCmd from './list';
import createApiSpecCmd from './create';
import * as apiSpecVersionsCmds from './versions';

export const command = 'api <command>';
export const desc = 'Manage solution APIs';

export const builder = (yargs: Argv) => {
  const cmds = yargs
    .command(listApisCmd)
    .command(createApiSpecCmd)
    .command(apiSpecVersionsCmds)
    .demandCommand(1);
  return cmds;
};

export const handler = () => {
  return;
};
