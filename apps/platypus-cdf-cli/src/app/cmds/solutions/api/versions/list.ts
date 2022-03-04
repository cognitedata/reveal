import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';

import { CommandArgumentType } from '@cognite/platypus-cdf-cli/app/types';
import { getSolutionSchemaHandler } from '../../utils';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'Api ExternalId',
    prompt: 'Enter the Api ExternalId',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 solutions api versions list --externalId=test-id',
  },
];
const DEBUG = _DEBUG.extend('solutions:api:versions:list');
export class SolutionsApiSpecVersionsListCommand extends CLICommand {
  async execute(args) {
    const solutionsSchemaHandler = getSolutionSchemaHandler();
    DEBUG('SolutionsApiService initialized');

    const apiVersionsResult = await solutionsSchemaHandler.versions({
      solutionId: args.externalId,
    });

    if (!apiVersionsResult.isSuccess) {
      throw apiVersionsResult.error;
    }

    const apiVersionsList = apiVersionsResult.getValue();
    DEBUG(
      'List of api versions retrieved successfully, %o',
      JSON.stringify(apiVersionsList, null, 2)
    );

    Response.success(apiVersionsList.map((api) => api.version).join('\n'));
  }
}

export default new SolutionsApiSpecVersionsListCommand(
  'list',
  'List all API Specs versions for current project',
  commandArgs
);
