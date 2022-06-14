import { CommandArgument, CommandArgumentType } from '../../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../../utils/logger';
import { getDataModelsHandler } from '../utils';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'Api external ID',
    prompt: 'Enter unique external ID',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 data-models api create --externalId=MyApi',
  },
  {
    name: 'description',
    description: 'Api description',
    prompt: 'Enter description for your Api',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 data-models api create --description="some description"',
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('solutions:api:create');
export class CreateApiSpecCommand extends CLICommand {
  async execute(args) {
    const dataModelsHandler = getDataModelsHandler();
    DEBUG('dataModelsHandler initialized');

    const response = await dataModelsHandler.create({
      name: args.externalId,
      description: args.description,
    });

    if (!response.isSuccess) {
      throw response.error;
    }

    DEBUG(
      'Api was created successfully, %o',
      JSON.stringify(response.getValue(), null, 2)
    );
    Response.success(
      `Api - "${args.externalId}" has been created successfully`
    );
  }
}

export default new CreateApiSpecCommand(
  'create',
  'Create or update api',
  commandArgs
);
