import { Arguments, Argv } from 'yargs';

import {
  CreateSolutionDTO,
  SolutionsHandler,
  SolutionsTemplatesApiService,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const command = 'create';

export const desc = 'Create a solution';

export const builder = (yargs: Argv<CreateSolutionDTO>): Argv =>
  yargs
    .positional('name', {
      type: 'string',
      description: 'Solution name',
      demandOption: true,
    })
    .option('description', {
      type: 'string',
      default: '',
      description: 'Solution description',
    })
    .option('owner', {
      type: 'string',
      default: '',
      description: 'Who is the owner of this solution',
    });

export const handler = async (args: Arguments<CreateSolutionDTO>) => {
  const client = getCogniteSDKClient();

  const solutionsHandler = new SolutionsHandler(
    new SolutionsTemplatesApiService(client)
  );

  const dto = {
    name: args.name,
    owner: args.owner,
    description: args.description,
  } as CreateSolutionDTO;
  const result = await solutionsHandler.create(dto);

  if (!result.isSuccess) {
    console.error(result.errorValue());
    return;
  }

  console.log(result.getValue());
};
