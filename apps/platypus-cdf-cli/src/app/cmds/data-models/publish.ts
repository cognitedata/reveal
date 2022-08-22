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
  ConflictMode,
  CreateDataModelVersionDTO,
  DataModelVersionHandler,
  ErrorType,
} from '@platypus/platypus-core';
import { readFileSync } from 'fs';
import { Arguments, Argv } from 'yargs';
import { promptQuestions, showConfirm } from '../../utils/enquirer-utils';

import { getDataModelVersionsHandler } from './utils';

const DEBUG = _DEBUG.extend('data-models:publish');

export const commandArgs = [
  {
    name: 'external-id',
    description: 'The external id of the data model',
    prompt: 'Enter data model external id',
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
] as CommandArgument[];

type DataModelPublishCommandArgs = BaseArgs & {
  'external-id': string;
  file: string;
  'allow-breaking-change': boolean;
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

    const publishConflictMode: ConflictMode = args['allow-breaking-change']
      ? 'NEW_VERSION'
      : 'PATCH';

    const graphqlSchema = await this.readGraphqlSchemaFile(args.file);
    const latestSchema = await this.getLatestPublishedVersion(
      args['external-id']
    );

    const dto: CreateDataModelVersionDTO = {
      externalId: args['external-id'],
      schema: graphqlSchema,
      version: latestSchema ? latestSchema.version : '1',
    };

    if (publishConflictMode === 'NEW_VERSION' && latestSchema) {
      dto.version = (parseInt(dto.version) + 1).toString();
    }

    const response = await this.dataModelVersionsHandler.publish(
      dto,
      publishConflictMode
    );
    if (!response.isSuccess) {
      if (
        (response.error.type as ErrorType) === 'BREAKING_CHANGE' &&
        args.interactive
      ) {
        console.error(
          'There are breaking change(s) in your data model.' +
            '\n' +
            'A new version of the data model will be created when publishing.' +
            '\n' +
            response.error.message +
            '\n'
        );
        const confirm = showConfirm(
          commandArgs.find((arg) => arg.name === 'allow-breaking-change')
        );
        const prompt = await promptQuestions({
          ...confirm,
          message:
            'Allow for a breaking change, resulting in a new version of the data model?',
        });
        if (prompt['allow-breaking-change']) {
          dto.version = (parseInt(dto.version) + 1).toString();
          const publishResponse = await this.dataModelVersionsHandler.publish(
            dto,
            'NEW_VERSION'
          );
          return publishResponse.isSuccess
            ? Response.success(
                'Successfully published data model v' + dto.version
              )
            : Response.error(publishResponse.error);
        }
      }
      throw response.error;
    }

    const responseSchema = response.getValue();

    const schemaPublishedOrUpdated =
      latestSchema && latestSchema.version === responseSchema.version
        ? 'updated'
        : 'published';

    DEBUG(
      `Api version ${
        response.getValue().version
      } has been ${schemaPublishedOrUpdated}, %o`,
      JSON.stringify(responseSchema, null, 2)
    );

    Response.success(
      `Api version ${
        response.getValue().version
      } has been ${schemaPublishedOrUpdated}`
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

  private async getLatestPublishedVersion(externalId: string) {
    const publishedVersionsResponse =
      await this.dataModelVersionsHandler.versions({
        dataModelId: externalId,
      });

    if (!publishedVersionsResponse.isSuccess) {
      throw publishedVersionsResponse.error;
    }

    DEBUG(
      'Fetched published schemas from API, %o',
      JSON.stringify(publishedVersionsResponse.getValue(), null, 2)
    );

    const publishedVersions = publishedVersionsResponse.getValue();
    const latestVersion = publishedVersions.sort((a, b) =>
      +a.version < +b.version ? 1 : -1
    )[0];

    DEBUG('Found latest schema, %o', JSON.stringify(latestVersion, null, 2));

    return latestVersion;
  }
}

export default new PublishCmd(
  'publish',
  'Updates a data model with a new GraphQL definition.',
  commandArgs
);
