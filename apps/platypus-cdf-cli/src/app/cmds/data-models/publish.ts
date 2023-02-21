import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import {
  BaseArgs,
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';
import {
  CreateDataModelVersionDTO,
  DataModelVersionHandler,
} from '@platypus/platypus-core';
import { readFileSync } from 'fs';
import { Arguments, Argv } from 'yargs';

import { getDataModelVersionsHandler } from './utils';

const DEBUG = _DEBUG.extend('data-models:publish');

export const commandArgs = [
  {
    name: 'external-id',
    description: 'The external id of the data model',
    prompt: 'Enter data model external ID',
    type: CommandArgumentType.STRING,
    required: true,
  },
  {
    name: 'file',
    description: 'The file containing the new GraphQL definition',
    prompt: 'Enter the path to the file containing your GraphQL definition',
    type: CommandArgumentType.STRING,
    required: true,
    example: `cdf data-models publish --externalId="Testing-DM" --file="./dm.gql"
       Update a data model with the name (external id) "Testing-DM" with local file "dm.gql"`,
  },
  {
    name: 'allow-breaking-change',
    description:
      'Allow for a breaking change, resulting in a new version of the data model',
    prompt: 'Allow for breaking change?',
    type: CommandArgumentType.BOOLEAN,
    required: false,
    initial: false,
    example: `cdf data-models publish --externalId="Testing-DM" --file="./dm.gql" --allow-breaking-change
      Update a data model with the name (external id) "Testing-DM" with local file "dm.gql", where in a breaking change, simply create a new version`,
  },
  {
    name: 'space',
    description:
      'Space id of the space the data model should belong to. Defaults to same as external-id.',
    type: CommandArgumentType.STRING,
    required: true,
    prompt: 'Enter data model space ID',
    promptDefaultValue: (commandArgs) => commandArgs['external-id'],
  },
  {
    name: 'dry-run',
    description:
      'Perform a dry run. Will only validate the data model without publishing.',
    type: CommandArgumentType.BOOLEAN,
    required: false,
    initial: false,
  },
  {
    name: 'version',
    description: 'Data model version',
    type: CommandArgumentType.STRING,
    prompt: 'Enter data model version',
    required: true,
  },
] as CommandArgument[];

type DataModelPublishCommandArgs = BaseArgs & {
  'external-id': string;
  file: string;
  'allow-breaking-change': boolean;
  space: string;
  'dry-run': boolean;
  version: string;
};

export class PublishCmd extends CLICommand {
  private dataModelVersionsHandler: DataModelVersionHandler;

  builder<T>(yargs: Argv<T>): Argv {
    yargs.usage(`
      Updates a data model with a new GraphQL definition. In case of any breaking changes, a new version of the data model will be published. For non-breaking changes, the existing version of the data model will be updated.

      Check out the full documentation here: https://docs.cognite.com/cli
    `);

    return super.builder(yargs);
  }

  async execute(args: Arguments<DataModelPublishCommandArgs>) {
    this.dataModelVersionsHandler = getDataModelVersionsHandler();
    DEBUG('dataModelVersionsHandler initialized');

    const graphqlSchema = await this.readGraphqlSchemaFile(args.file);

    const dto: CreateDataModelVersionDTO = {
      externalId: args['external-id'],
      schema: graphqlSchema,
      version: args['version'],
      space: args['space'],
    };

    if (args['dry-run']) {
      const response = await this.dataModelVersionsHandler.validate(dto, true);
      if (response.isSuccess) {
        Response.success('Data model is valid');
      } else {
        response.error.forEach((error) => {
          Response.error(error.message);
        });
      }
      return;
    }

    const response = await this.dataModelVersionsHandler.publish(dto, 'PATCH');

    DEBUG(`Publish request result`, JSON.stringify(response, null, 2));

    if (!response.isSuccess) {
      response.error.errors.forEach((error) => {
        if (error.kind === 'DIFF_ERROR') {
          Response.error(error.message);
          const lineWithError = graphqlSchema
            .split('\n')
            [error.location.start.line - 1].trim();

          Response.error(`Line ${error.location.start.line}: ${lineWithError}`);
          if (error.hint) {
            Response.warn(`Hint: ${error.hint}`);
          }
        } else {
          Response.error(error.message);
        }
      });
      return Response.error(response.error);
    }

    Response.success(
      `Successfully published changes to data model version ${dto.version}.`
    );
  }

  private async readGraphqlSchemaFile(path: string) {
    DEBUG('Reading graphql file ' + path);
    const schema = readFileSync(path, {
      encoding: 'utf-8',
    }).toString();
    DEBUG('Schema contents %o', schema);

    return schema;
  }
}

export default new PublishCmd(
  'publish',
  'Updates a data model with a new GraphQL definition.',
  commandArgs
);
