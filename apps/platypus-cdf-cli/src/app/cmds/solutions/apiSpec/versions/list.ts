import { SolutionsApiService } from '@platypus/platypus-core';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';

import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';
import { CommandArgumentType } from '@cognite/platypus-cdf-cli/app/types';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'ApiSpec ExternalId',
    prompt: 'Enter the ApiSpec ExternalId',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 solutions apiSpec versions list --externalId=test-id',
  },
];
const DEBUG = _DEBUG.extend('platypus-cdf-cli:solutions:apiSpec:versions:list');
export class SolutionsApiSpecVersionsListCommand extends CLICommand {
  async execute(args) {
    const client = getCogniteSDKClient();
    DEBUG('CDF Clint initialized');

    const solutionSchemaApi = new SolutionsApiService(client);
    DEBUG('SolutionsApiService initialized');

    const apiSpecVersionsList = await solutionSchemaApi.getApiSpecsByIds(
      args.externalId,
      true
    );
    DEBUG(
      'List of api specs retrieved successfully, %o',
      JSON.stringify(apiSpecVersionsList, null, 2)
    );

    Response.success(
      apiSpecVersionsList[0].versions.map((api) => api.version).join('\n')
    );
  }
}

export default new SolutionsApiSpecVersionsListCommand(
  'list',
  'List all API Specs versions for current project',
  commandArgs
);
