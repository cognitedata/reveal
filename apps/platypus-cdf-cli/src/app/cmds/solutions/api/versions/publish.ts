import { CommandArgument, CommandArgumentType } from '../../../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../../../utils/logger';
import { readFileSync } from 'fs';
import { getSolutionSchemaHandler } from '../../utils';
import { CreateSchemaDTO } from '@platypus/platypus-core';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'Api ExternalId',
    prompt: 'Enter the API externalId',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      '$0 solutions api versions publish --externalId=test-id --file=./file.graphql --apiVersion=1',
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
    name: 'bindings',
    description: 'Schema Bindings file path',
    prompt:
      'Please specify the the path to the schema bindings file that you want to use',
    type: CommandArgumentType.STRING,
    required: false,
  },
  {
    name: 'conflictMode',
    description:
      'The conflict mode that will be used when an existing schema already exists.',
    prompt: 'Please specify the conflict mode that you want to use',
    type: CommandArgumentType.SELECT,
    initial: 'NEW_VERSION',
    required: false,
    options: {
      choices: ['PATCH', 'NEW_VERSION'],
    },
  },
  {
    name: 'apiVersion',
    description: 'Api Version',
    prompt: 'Enter the API version in case if you want to update',
    type: CommandArgumentType.STRING,
    required: false,
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('solutions:api:versions:publish');

export class CreateApiSpecVersionCommand extends CLICommand {
  async execute(args) {
    const { conflictMode, externalId, apiVersion, bindings } = args;

    const schemaSchemaHandler = getSolutionSchemaHandler();
    DEBUG('SolutionsApiService initialized');

    DEBUG('Reading specified graphql file');
    const graphqlSchema = readFileSync(args.file, {
      encoding: 'utf-8',
    }).toString();

    DEBUG('Schema contents %o', graphqlSchema);

    let schemaBindings;
    if (bindings) {
      try {
        DEBUG('Reading specified bindings file');
        schemaBindings = readFileSync(bindings, {
          encoding: 'utf-8',
        }).toString();
        schemaBindings = JSON.parse(schemaBindings);
      } catch (ex) {
        DEBUG(JSON.stringify(ex, null, 2));
        Response.error(args.verbose ? JSON.stringify(ex, null, 2) : ex.message);
        throw ex;
      }

      DEBUG('Schema bindings contents %o', schemaBindings);
    }

    const dto = {
      schema: graphqlSchema,
      solutionId: externalId,
      version: apiVersion,
      bindings: schemaBindings,
    } as CreateSchemaDTO;

    let response;
    try {
      response = await (conflictMode === 'NEW_VERSION'
        ? schemaSchemaHandler.publish(dto)
        : schemaSchemaHandler.update(dto));
    } catch (err) {
      console.log(err);
      throw err;
    }

    if (!response.isSuccess) {
      throw response.error;
    }

    DEBUG(
      'Api version was published successfully, %o',
      JSON.stringify(response.getValue(), null, 2)
    );
    Response.log(`The Api version was published successfully`);
  }
}

export default new CreateApiSpecVersionCommand(
  'publish',
  'Publish API Schema Version',
  commandArgs
);
