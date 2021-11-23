import { Arguments, Argv } from 'yargs';

import {
  CreateSolutionDTO,
  DeleteSolutionDTO,
  SolutionsHandler,
  SolutionsTemplatesApiService,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { BaseArgs } from '../../types';

export const command = 'delete <id>';

export const desc = 'Delete a solution';

export const builder = (yargs: Argv<CreateSolutionDTO>): Argv =>
  yargs.positional('id', {
    type: 'string',
    description: 'Solution Id',
    demandOption: true,
  });

export const handler = async (
  args: Arguments<BaseArgs & DeleteSolutionDTO>
) => {
  const client = getCogniteSDKClient();

  const solutionsHandler = new SolutionsHandler(
    new SolutionsTemplatesApiService(client)
  );

  const result = await solutionsHandler.delete({
    id: args.id,
  });

  if (!result.isSuccess) {
    return args.logger.error(
      `Failed to delete solution because of ${result.error}`
    );
  }
  args.logger.log(`Solution "${args.id}" is deleted successfully`);
};
