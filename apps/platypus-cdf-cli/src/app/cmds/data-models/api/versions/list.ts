import { CLICommand } from '../../../../common/cli-command';
import { CommandArgumentType } from '../../../../types';
import Response, { DEBUG as _DEBUG } from '../../../../utils/logger';
import { getDataModelVersionsHandler } from '../../utils';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'Api external ID',
    prompt: 'Enter the api external ID',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 data-models api versions list --externalId=MyApi',
  },
];
const DEBUG = _DEBUG.extend('solutions:api:versions:list');
export class SolutionsApiSpecVersionsListCommand extends CLICommand {
  async execute(args) {
    const dataModelVersionsHandler = getDataModelVersionsHandler();
    DEBUG('dataModelVersionsHandler initialized');

    const apiVersionsResult = await dataModelVersionsHandler.versions({
      externalId: args.externalId,
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
