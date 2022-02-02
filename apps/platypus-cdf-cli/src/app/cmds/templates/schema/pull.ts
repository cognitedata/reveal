import { TemplatesApiService } from '@platypus/platypus-core';
import { Arguments } from 'yargs';
import CS from 'configstore';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';
import { BaseArgs } from '@cognite/platypus-cdf-cli/app/types';
import { injectRCFile } from '@cognite/platypus-cdf-cli/app/common/config';
import { CONSTANTS } from '@cognite/platypus-cdf-cli/app/constants';

export const command = 'pull';
export const desc = `Downloads the schema for the given template group (version is read from "${CONSTANTS.PROJECT_CONFIG_FILE_NAME}" file).`;

const DEBUG = _DEBUG.extend('templates:schema:pull');

export class TemplatesSchemaPullCommand extends CLICommand {
  @injectRCFile()
  async execute(args: Arguments<BaseArgs>) {
    const client = getCogniteSDKClient();
    DEBUG`CDF Clint initialized`;

    const templatesApi = new TemplatesApiService(client);
    DEBUG`TemplatesApiService initialized`;
    DEBUG`Retrieving list of versions for template group`;

    const schema = await templatesApi.listSchemaVersions({
      solutionId: args.solutionConfig.all.config.templateId,
      version: args.solutionConfig.all.config.templateVersion.toString(),
    });
    DEBUG`Got the schema, ${JSON.stringify(schema)}`;

    if (!schema || !schema.length) {
      return Response.error(
        'There is no schema for this template group and version combination. Please check once again!'
      );
    }

    if (schema.length > 1) {
      DEBUG('More than one schema found for this version. %o', schema);
      return Response.error(
        'More than one schema found for this version, skipping download.'
      );
    }

    Response.success(schema[0].schema);
  }
}

export default new TemplatesSchemaPullCommand(command, desc, []);
