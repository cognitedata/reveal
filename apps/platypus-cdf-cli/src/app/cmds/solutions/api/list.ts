import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';

import { getSolutionHandler } from '../utils';

const DEBUG = _DEBUG.extend('solutions:api:list');
export class SolutionsApiSpecsListCommand extends CLICommand {
  async execute() {
    const solutionsHandler = getSolutionHandler();
    DEBUG('SolutionsApiService initialized');

    const apisResponse = await solutionsHandler.list();

    if (!apisResponse.isSuccess) {
      throw apisResponse.error;
    }

    DEBUG(
      'List of apis retrieved successfully, %o',
      JSON.stringify(apisResponse.getValue(), null, 2)
    );

    Response.success(
      apisResponse
        .getValue()
        .map((api) => api.id)
        .join('\n')
    );
  }
}

export default new SolutionsApiSpecsListCommand(
  'list',
  'List all APIs for current project',
  []
);
