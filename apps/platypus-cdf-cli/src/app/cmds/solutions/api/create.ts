import { CommandArgument, CommandArgumentType } from '../../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../../utils/logger';
import { getSolutionHandler } from '../utils';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'Api ExternalId',
    prompt: 'Enter unique ExternalId for the Api',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      '$0 solutions api create --externalId=test-id --description="some description" ',
  },
  {
    name: 'description',
    description: 'Api description',
    prompt: 'Enter description for your Api',
    type: CommandArgumentType.STRING,
    required: true,
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('solutions:api:create');
export class CreateApiSpecCommand extends CLICommand {
  async execute(args) {
    const solutionsHandler = getSolutionHandler();
    DEBUG('SolutionsApiService initialized');

    const response = await solutionsHandler.create({
      name: args.externalId,
      description: args.description,
    });

    if (!response.isSuccess) {
      throw response.error;
    }

    DEBUG(
      'Api was saved successfully, %o',
      JSON.stringify(response.getValue(), null, 2)
    );
    Response.success(`Api - "${args.externalId}" is created successfully`);
  }
}

export default new CreateApiSpecCommand(
  'create',
  'Create or update api',
  commandArgs
);
