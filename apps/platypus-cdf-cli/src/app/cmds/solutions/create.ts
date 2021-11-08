import { Arguments, Argv, CommandBuilder } from 'yargs';

import {
  CreateSolutionDTO,
  SolutionsHandler,
  SolutionsTemplatesApiService,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const command = 'create';
export const desc = 'Create a solution';
// export const builder: CommandBuilder = {
//   full: {
//     description: 'add --full for the full schema including generated types',
//     default: false,
//     type: 'boolean',
//   },
//   type: {
//     description: 'see just a specific type',
//     type: 'array',
//   },
// };

export const builder = (yargs: Argv<CreateSolutionDTO>) => {
  yargs
    .positional('name', {
      type: 'string',
      default: false,
      description: 'Solution name',
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
};

export const handler = async (args: Arguments<CreateSolutionDTO>) => {
  const client = getCogniteSDKClient();

  const solutionsHandler = new SolutionsHandler(
    new SolutionsTemplatesApiService(client as any)
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
