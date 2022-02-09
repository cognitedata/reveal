import { Argv } from 'yargs';
import publishApiCmd from './publish';
import ingestDataCmd from './ingest';

export const command = 'storage <command>';
export const desc = 'Manage solution storage';

export const builder = (yargs: Argv) => {
  const cmds = yargs
    .command(publishApiCmd)
    .command(ingestDataCmd)
    .demandCommand(1, 'You need at least one command before moving on');
  return cmds;
};

export const handler = () => {
  return;
};
