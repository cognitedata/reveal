import { CreateSchemaDTO, TemplatesApiService } from '@platypus/platypus-core';
import { readFileSync } from 'fs';
import { Arguments } from 'yargs';
import {
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';

const commandArgs = [
  {
    name: 'externalId',
    description: 'Template Group ExternalId',
    prompt: 'Please specify the template group External Id',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      '$0 platypus templates schema publish --externalId=some-external-id --file=./file-path.graphql --templateVersion=1 --conflictMode=Update',
  },
  {
    name: 'file',
    description: 'Schema file path',
    prompt:
      'Please specify the the path to the schema file that you want to publish',
    type: CommandArgumentType.STRING,
    required: true,
  },
  {
    name: 'templateVersion',
    description: 'Specific template version',
    prompt: 'Please specify the version that you want to use',
    type: CommandArgumentType.NUMBER,
    required: false,
  },
  {
    name: 'conflictMode',
    description:
      'The Template Group conflict mode that will be used when an existing schema already exists.',
    prompt: 'Please specify the conflict mode that you want to use',
    type: CommandArgumentType.SELECT,
    defaultValue: 'Patch',
    required: false,
    options: {
      choices: ['Patch', 'Update', 'Force'],
    },
  },
] as CommandArgument[];

export const command = 'publish';

export const desc = 'A new version of the template schema will be published';

interface PublishSchemaArgs {
  file: string;
  externalId: string;
  version?: number;
  conflictMode: string;
}

export class TemplatesPublishSchemaCommand extends CLICommand {
  async execute(args: Arguments<PublishSchemaArgs>) {
    const client = getCogniteSDKClient();
    const templatesApi = new TemplatesApiService(client);
    const { externalId, conflictMode } = args;

    let graphqlSchema;
    try {
      graphqlSchema = readFileSync(args.file, {
        encoding: 'utf-8',
      }).toString();
    } catch (ex) {
      Response.error(args.verbose ? JSON.stringify(ex, null, 2) : ex.message);
      return;
    }

    const dto = {
      schema: graphqlSchema,
      solutionId: externalId,
      version: args.templateVersion
        ? args.templateVersion.toString()
        : undefined,
    } as CreateSchemaDTO;

    try {
      await (conflictMode === 'Update'
        ? templatesApi.publishSchema(dto)
        : templatesApi.updateSchema(dto, conflictMode === 'Force'));

      Response.log(
        conflictMode === 'Update'
          ? `Template group ${externalId} is created successfully`
          : `Template group "${externalId}" was updated successfully`
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
