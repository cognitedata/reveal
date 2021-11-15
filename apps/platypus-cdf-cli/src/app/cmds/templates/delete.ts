import { Arguments, Argv } from 'yargs';

import { DeleteSolutionDTO } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const command = 'delete <id>';

export const desc = 'Delete a solution';

export const builder = (yargs: Argv): Argv =>
  yargs.positional('id', {
    type: 'string',
    description:
      'Template group external id to delete (you must have proper permission to execute the same)',
    demandOption: true,
  });

export const handler = async (args: Arguments<DeleteSolutionDTO>) => {
  const client = getCogniteSDKClient();

  try {
    await client.templates.groups.delete([{ externalId: args.id }]);
    console.log(`Deleted the template group "${args.id}" successfully.`);
  } catch (error) {
    console.error(error);
  }
};
