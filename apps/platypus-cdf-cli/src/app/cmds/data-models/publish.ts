import { readFileSync } from 'fs';

import {
  CreateDataModelVersionDTO,
  DataModel,
  DataModelsHandler,
  DataModelVersionHandler,
  DataModelVersionValidator,
  PlatypusValidationError,
  Validator,
} from '@platypus/platypus-core';
import { Arguments, Argv } from 'yargs';

import { CLICommand } from '../../common/cli-command';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../types';
import Response, { DEBUG as _DEBUG } from '../../utils/logger';

import {
  autoIncrementVersion,
  getDataModelsHandler,
  getDataModelVersionsHandler,
} from './utils';

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
    name: 'space',
    description:
      'Space id of the space the data model should belong to. Defaults to same as external-id.',
    type: CommandArgumentType.STRING,
    required: true,
    prompt: 'Enter data model space ID',
    promptDefaultValue: (commandArgs) => commandArgs['external-id'],
  },
  {
    name: 'previous-version',
    description:
      'The version to check breaking change against. Defaults to latest version.',
    type: CommandArgumentType.STRING,
    required: false,
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
    required: false,
  },
  {
    name: 'auto-increment',
    description:
      'Automatically increment the data model version, takes the latest version and +1 at the end.',
    type: CommandArgumentType.BOOLEAN,
    required: false,
    initial: false,
  },
] as CommandArgument[];

type DataModelPublishCommandArgs = BaseArgs & {
  'external-id': string;
  file: string;
  space: string;
  'dry-run': boolean;
  'auto-increment': boolean;
  'previous-version': string;
  version?: string;
};

export class PublishCmd extends CLICommand {
  private dataModelVersionsHandler: DataModelVersionHandler;
  private dataModelsHandler: DataModelsHandler;

  builder<T>(yargs: Argv<T>): Argv {
    yargs.usage(`
      Updates a data model with a new GraphQL definition. In case of any breaking changes, a new version of the data model will be published. For non-breaking changes, the existing version of the data model will be updated.

      Check out the full documentation here: https://docs.cognite.com/cli
    `);

    return super.builder(yargs);
  }

  async execute(args: Arguments<DataModelPublishCommandArgs>) {
    const validator = new Validator(args);

    this.dataModelVersionsHandler = getDataModelVersionsHandler();
    this.dataModelsHandler = getDataModelsHandler();
    DEBUG('dataModelVersionsHandler initialized');

    let graphqlSchema;
    try {
      graphqlSchema = await this.readGraphqlSchemaFile(args.file);
    } catch (e) {
      Response.error(`Unable to read specified GraphQL file: ${args.file}`);
      return;
    }

    const dataModelVersionsResponse =
      await this.dataModelsHandler.fetchVersions({
        dataModelId: args['external-id'],
        space: args.space,
      });
    if (!dataModelVersionsResponse.isSuccess) {
      Response.error(
        'The data model specified does not exist. Create a data model first before publishing a new version.'
      );
      return;
    }

    let dataModelResponse: DataModel;
    const versions = dataModelVersionsResponse.getValue();
    let previousVersion = versions
      .sort(
        // latest first
        (a, b) => b.lastUpdatedTime - a.lastUpdatedTime
      )
      .find((el, i) =>
        // previous version specified? then choose previous version, otherwise, latest
        args['previous-version']
          ? el.version === args['previous-version']
          : i === 0
      );

    if (!previousVersion) {
      if (args['previous-version']) {
        Response.error(
          `The previous version ${args['previous-version']} does not exist.`
        );
        return;
      }

      dataModelResponse = (
        await this.dataModelsHandler.fetch({
          dataModelId: args['external-id'],
          space: args.space,
        })
      ).getValue();
    }

    const {
      version: currentVersion,
      schema: currentVersionDML,
      name: currentVersionName,
      description: currentVersionDesc,
    } = previousVersion || {
      version: undefined,
      schema: dataModelResponse.graphQlDml || '',
      name: dataModelResponse.name,
      description: dataModelResponse.description,
    };

    // if no changes in DML
    if (currentVersionDML.trim() === graphqlSchema.trim()) {
      Response.success(
        'The data model will not be updated as the file is identical to the current version.'
      );
      return;
    }

    if (!args.version) {
      if (args['auto-increment']) {
        args['version'] = autoIncrementVersion(
          // use the most recent version
          versions[0]?.version ?? dataModelResponse?.version
        );
      } else {
        Response.error('You must specify a version or use `--auto-increment`.');
        return;
      }
    }

    const dto: CreateDataModelVersionDTO = {
      externalId: args['external-id'],
      schema: graphqlSchema,
      previousVersion: args['previous-version'] || currentVersion,
      version: args['version'],
      space: args['space'],
    };

    Response.info(
      `Publishing to data model version ${dto.version}. This can take a few minutes...`
    );

    validator.addRule('version', new DataModelVersionValidator());

    const validationResult = validator.validate();
    if (!validationResult.valid) {
      let validationErrors = [];
      for (const field in validationResult.errors) {
        validationErrors.push({ message: validationResult.errors[field] });
      }

      throw new PlatypusValidationError(
        'Could not publish data model, one or more of the arguments you passed are invalid.',
        'VALIDATION',
        validationErrors
      );
    }

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

    const response = await this.dataModelVersionsHandler.publish(
      {
        ...dto,
        name: currentVersionName,
        description: currentVersionDesc,
      },
      'PATCH'
    );

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
