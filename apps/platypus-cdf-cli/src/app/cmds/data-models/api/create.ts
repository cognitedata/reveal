import { CreateDataModelCommand } from '@fusion/data-modeling';

import { CLICommand } from '../../../common/cli-command';
import { CommandArgument, CommandArgumentType } from '../../../types';
import { getCogniteSDKClient } from '../../../utils/cogniteSdk';
import Response, { DEBUG as _DEBUG } from '../../../utils/logger';

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
    const createDataModelCommand = CreateDataModelCommand.create(
      getCogniteSDKClient()
    );

    DEBUG('createDataModelCommand initialized');

    const response = await createDataModelCommand.execute({
      name: args.externalId,
      description: args.description,
    });

    DEBUG(
      'Api was created successfully, %o',
      JSON.stringify(response, null, 2)
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
