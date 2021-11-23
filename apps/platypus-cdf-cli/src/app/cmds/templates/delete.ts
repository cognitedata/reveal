import { Arguments, Argv } from 'yargs';

import { DeleteSolutionDTO } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { BaseArgs } from '../../types';

export const command = 'delete <id>';

export const desc = 'Delete a solution';

export const builder = (yargs: Argv): Argv =>
  yargs.positional('id', {
    type: 'string',
    description:
      'Template group external id to delete (you must have proper permission to execute the same)',
    demandOption: true,
  });

export const handler = async (
  args: Arguments<BaseArgs & DeleteSolutionDTO>
) => {
  const client = getCogniteSDKClient();

  try {
    await client.templates.groups.delete([{ externalId: args.id }]);
    args.logger.log(`Deleted the template group "${args.id}" successfully.`);
  } catch (error) {
    args.logger.error(error);
  }
};
