import { SolutionsApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../../utils/cogniteSdk';
import { CommandArgument, CommandArgumentType } from '../../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../../utils/logger';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'ApiSpec ExternalId',
    prompt: 'Enter unique ExternalId for the ApiSpec',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      '$0 solutions apiSpec create --externalId=test-id --description="some description" --name="my-api-spec"',
  },
  {
    name: 'name',
    description: 'ApiSpec name',
    prompt: 'Enter the ApiSpec name',
    type: CommandArgumentType.STRING,
    required: true,
  },
  {
    name: 'description',
    description: 'ApiSpec description',
    prompt: 'Enter description for your ApiSpec',
    type: CommandArgumentType.STRING,
    required: true,
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('platypus-cdf-cli:solutions:apiSpec:create');
export class CreateApiSpecCommand extends CLICommand {
  async execute(args) {
    const client = getCogniteSDKClient();
    DEBUG('CDF Clint initialized');

    const solutionSchemaApi = new SolutionsApiService(client);
    DEBUG('SolutionsApiService initialized');

    const response = await solutionSchemaApi.updateApiSpec({
      externalId: args.externalId,
      name: args.externalId,
      description: args.description,
    });

    DEBUG(
      'ApiSpec was saved successfully, %o',
      JSON.stringify(response, null, 2)
    );
    Response.success(`ApiSpec - "${args.externalId}" is created successfully`);
  }
}

export default new CreateApiSpecCommand(
  'create',
  'Create or update api spec',
  commandArgs
);
