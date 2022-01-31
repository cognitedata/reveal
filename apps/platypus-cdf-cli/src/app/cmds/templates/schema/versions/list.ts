import { TemplatesApiService } from '@platypus/platypus-core';
import { Arguments } from 'yargs';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';
import { BaseArgs } from '@cognite/platypus-cdf-cli/app/types';
import { injectRCFile } from '@cognite/platypus-cdf-cli/app/common/config';

export const command = 'list';
export const desc = 'Retrieves a list of versions sorted in descending order.';

const DEBUG = _DEBUG.extend('templates:schema:versions:list');

export class TemplatesVersionsListCommand extends CLICommand {
  @injectRCFile()
  async execute(args: Arguments<BaseArgs>) {
    const client = getCogniteSDKClient();
    DEBUG`CDF Clint initialized`;

    const templatesApi = new TemplatesApiService(client);
    DEBUG`TemplatesApiService initialized`;
    DEBUG`Retrieving list of versions for template group`;

    const versions = await templatesApi.listSchemaVersions({
      solutionId: args.solutionConfig.config.templateId,
    });
    DEBUG`List of versions retrieved successfully, ${JSON.stringify(versions)}`;

    if (!versions || !versions.length) {
      return Response.error(
        'There are no schemas created for this template group. Please create one!'
      );
    }

    Response.success(versions.map((item) => item.version).join('\n'));
  }
}

export default new TemplatesVersionsListCommand(command, desc, []);
