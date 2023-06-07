import { Argv } from 'yargs';

import DMSSpacesApplyCommand from './apply';
import DMSSpacesDeleteCommand from './delete';
import DMSSpacesListCommand from './list';

export const command = 'spaces <command>';
export const desc = 'Manage data model storage spaces';

export const builder = (yargs: Argv) =>
  yargs
    .command(DMSSpacesListCommand)
    .command(DMSSpacesApplyCommand)
    .command(DMSSpacesDeleteCommand)
    .demandCommand(1);

export const handler = () => {
  return;
};
