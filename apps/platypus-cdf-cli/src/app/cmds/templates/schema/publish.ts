import {
  CreateDataModelVersionDTO,
  TemplatesApiService,
} from '@platypus/platypus-core';
import { readFileSync } from 'fs';
import { Arguments } from 'yargs';
import {
  BaseArgs,
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { injectRCFile } from '@cognite/platypus-cdf-cli/app/common/config';

const commandArgs = [
  {
    name: 'conflictMode',
    description:
      'The Template Group conflict mode that will be used when an existing schema already exists.',
    prompt: 'Please specify the conflict mode that you want to use',
    type: CommandArgumentType.SELECT,
    initial: 'Patch',
    required: false,
    options: {
      choices: ['Patch', 'Update', 'Force'],
    },
  },
] as CommandArgument[];

export const command = 'publish';

export const desc = 'A new version of the template schema will be published';

type PublishSchemaArgs = BaseArgs & {
  conflictMode: string;
};

export class TemplatesPublishSchemaCommand extends CLICommand {
  @injectRCFile()
  async execute(args: Arguments<PublishSchemaArgs>) {
    const client = getCogniteSDKClient();
    const templatesApi = new TemplatesApiService(client);

    const { conflictMode } = args;
    const { templateId, templateVersion, schema } =
      args.solutionConfig.all.config;

    if (!schema) {
      throw new Error(
        'No schema found in solution config, please run pull to download schema first or edit and add the schema field in the solution config the the schema file.'
      );
    }

    const graphqlSchema = readFileSync(schema, {
      encoding: 'utf-8',
    }).toString();

    const dto = {
      schema: graphqlSchema,
      externalId: templateId,
      version: templateVersion ? templateVersion.toString() : undefined,
    } as CreateDataModelVersionDTO;

    try {
      await (conflictMode === 'Update'
        ? templatesApi.publishSchema(dto)
        : templatesApi.updateSchema(dto, conflictMode === 'Force'));

      Response.success(
        conflictMode === 'Update'
          ? `Template group ${templateId} is created successfully`
          : `Template group "${templateId}" was updated successfully`
      );
    } catch (error) {
      if (error.type === 'BREAKING_CHANGE') {
        Response.log(
          'Breaking changes found, please run:\nconflictMode=Update to publish new version\nconflictMode=Force to force update the schema'
        );
      } else {
        const { code, message } = error;
        Response.error(
          args.verbose ? JSON.stringify(error, null, 2) : `${code} - ${message}`
        );
      }
    }
  }
}

export default new TemplatesPublishSchemaCommand(command, desc, commandArgs);
