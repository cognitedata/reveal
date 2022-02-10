import { Argv } from 'yargs';
import listAPiSpecs from './list';
import createApiSpecCmd from './create';
import * as apiSpecVersionsCmds from './versions';

export const command = 'apiSpec <command>';
export const desc = 'Manage solution API Specs';

export const builder = (yargs: Argv) => {
  const cmds = yargs
    .command(listAPiSpecs)
    .command(createApiSpecCmd)
    .command(apiSpecVersionsCmds)
    .demandCommand(1);
  return cmds;
};

export const handler = () => {
  return;
};
