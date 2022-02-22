import { TemplatesApiService } from '@platypus/platypus-core';
import { Arguments } from 'yargs';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';
import {
  BaseArgs,
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';
import { injectRCFile } from '@cognite/platypus-cdf-cli/app/common/config';
import { CONSTANTS } from '@cognite/platypus-cdf-cli/app/constants';
import { promises } from 'fs';

const { writeFile } = promises;

export const command = 'pull';
export const desc = `Downloads the schema for the given template group (version is read from "${CONSTANTS.PROJECT_CONFIG_FILE_NAME}" file).`;

const DEBUG = _DEBUG.extend('templates:schema:pull');

type TemplatesSchemaPullCommandArgs = BaseArgs & {
  file: string;
};

const commandArgs: CommandArgument[] = [
  {
    name: 'file',
    alias: 'f',
    description: 'schema file name',
    type: CommandArgumentType.STRING,
    required: false,
    initial: CONSTANTS.PROJECT_CONFIG_DEFAULT_SCHEMA_FILE_NAME,
  },
];

export class TemplatesSchemaPullCommand extends CLICommand {
  @injectRCFile()
  async execute(args: Arguments<TemplatesSchemaPullCommandArgs>) {
    const client = getCogniteSDKClient();
    DEBUG`CDF Clint initialized`;

    const templatesApi = new TemplatesApiService(client);
    DEBUG`TemplatesApiService initialized`;
    DEBUG`Retrieving list of versions for template group`;

    const version = args.solutionConfig.all.config.templateVersion;

    const schema = await templatesApi.listSchemaVersions({
      solutionId: args.solutionConfig.all.config.templateId,
      version: version === 0 ? undefined : version.toString(),
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

    DEBUG('Writing schema to file');
    await writeFile(args.file, schema[0].schema);
    DEBUG('Schema written to file successfully %o', schema[0].schema);

    // set the config file to the downloaded schema file name
    DEBUG('Setting the config file to the downloaded schema file name');
    args.solutionConfig.set('config.schema', args.file);

    DEBUG('DONE');
    Response.success('Schema pulled successfully');
  }
}

export default new TemplatesSchemaPullCommand(command, desc, commandArgs);
