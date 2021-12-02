import { Arguments, Argv } from 'yargs';

import {
  CreateSolutionDTO,
  SolutionsHandler,
  SolutionTemplatesFacadeService,
  TemplatesApiService,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { BaseArgs } from '../../types';

export const command = 'create <name>';

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

export const handler = async (
  args: Arguments<BaseArgs & CreateSolutionDTO>
) => {
  const client = getCogniteSDKClient();

  const solutionsHandler = new SolutionsHandler(
    new SolutionTemplatesFacadeService(new TemplatesApiService(client))
  );

  const dto = {
    name: args.name,
    owner: args.owner,
    description: args.description,
  } as CreateSolutionDTO;
  const result = await solutionsHandler.create(dto);

  if (!result.isSuccess) {
    return args.logger.error(result.error);
  }

  args.logger.info(`Solution "${args.name}" is successfully created.`);
};
