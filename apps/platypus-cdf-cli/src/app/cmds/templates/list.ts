import { TemplatesApiService } from '@platypus/platypus-core';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';

import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';

const DEBUG = _DEBUG.extend('platypus-cdf-cli:templates:list');
export class TemplatesListCommand extends CLICommand {
  async execute() {
    const client = getCogniteSDKClient();
    DEBUG('CDF Clint initialized');

    const templatesApi = new TemplatesApiService(client);
    DEBUG('TemplatesApiService initialized');

    const templates = await templatesApi.listTemplateGroups();
    DEBUG(
      'List of templates retrieved successfully, %o',
      JSON.stringify(templates, null, 2)
    );

    Response.success(
      templates.map((template) => template.externalId).join('\n')
    );
  }
}

export default new TemplatesListCommand(
  'list',
  'List all template groups for current project',
  []
);
