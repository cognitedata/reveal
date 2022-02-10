import { Argv } from 'yargs';
import listSolutions from './list';
import publishApiCmd from './publish';

export const command = 'api <command>';
export const desc = 'Manage solution APIs';

export const builder = (yargs: Argv) => {
  const cmds = yargs
    .command(listSolutions)
    .command(publishApiCmd)
    .demandCommand(1);
  return cmds;
};

export const handler = () => {
  return;
};
