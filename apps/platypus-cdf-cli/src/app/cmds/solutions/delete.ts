import { Arguments, Argv } from 'yargs';

import {
  CreateSolutionDTO,
  DeleteSolutionDTO,
  SolutionsHandler,
  SolutionsTemplatesApiService,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const command = 'delete';
export const desc = 'Delete a solution';

export const builder = (yargs: Argv<CreateSolutionDTO>) => {
  yargs.positional('id', {
    type: 'string',
    default: false,
    description: 'Solution Id',
  });
};

export const handler = async (args: Arguments<DeleteSolutionDTO>) => {
  const client = getCogniteSDKClient();

  const solutionsHandler = new SolutionsHandler(
    new SolutionsTemplatesApiService(client as any)
  );

  const result = await solutionsHandler.delete({
    id: args.id
  });

  if (!result.isSuccess) {
    return console.error(result.errorValue());
  }

  console.log(result.getValue());
};
