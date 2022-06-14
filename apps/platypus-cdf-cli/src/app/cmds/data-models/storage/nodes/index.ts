import { Argv } from 'yargs';
import ingestNodeCmd from './ingest';
import listNodeCmd from './list';

export const command = 'nodes <command>';
export const desc = 'Manage data model storage nodes';

export const builder = (yargs: Argv) => {
  const cmds = yargs.command(ingestNodeCmd).command(listNodeCmd);
  cmds.demandCommand(1);
  return cmds;
};

export const handler = () => {
  return;
};
