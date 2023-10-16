import { ListDataModelsQuery } from '@fusion/data-modeling';

import { CLICommand } from '../../../common/cli-command';
import { getCogniteSDKClient } from '../../../utils/cogniteSdk';
import Response, { DEBUG as _DEBUG } from '../../../utils/logger';

const DEBUG = _DEBUG.extend('solutions:api:list');
export class SolutionsApiSpecsListCommand extends CLICommand {
  async execute() {
    const listDataModelsQry = ListDataModelsQuery.create(getCogniteSDKClient());
    DEBUG('listDataModelsQry initialized');

    const apisResponse = await listDataModelsQry.execute();

    DEBUG(
      'List of apis retrieved successfully, %o',
      JSON.stringify(apisResponse, null, 2)
    );

    Response.success(apisResponse.map((api) => api.id).join('\n'));
  }
}

export default new SolutionsApiSpecsListCommand(
  'list',
  'List all APIs for current project',
  []
);
