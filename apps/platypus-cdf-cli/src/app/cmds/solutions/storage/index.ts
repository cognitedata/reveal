import { Argv } from 'yargs';
import listStorageCmd from './list';
import upsertStorageCmd from './upsert';
import listInstancesCommand from './list-instances';
import ingestInstancesCommand from './ingest';

export const command = 'storage <command>';
export const desc = 'Manage storage';

export const builder = (yargs: Argv) => {
  const cmds = yargs
    .command(listStorageCmd)
    .command(upsertStorageCmd)
    .command(listInstancesCommand)
    .command(ingestInstancesCommand)
    .demandCommand(1);
  return cmds;
};

export const handler = () => {
  return;
};
