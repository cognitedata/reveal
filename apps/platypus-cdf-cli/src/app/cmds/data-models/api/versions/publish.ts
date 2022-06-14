import { CommandArgument, CommandArgumentType } from '../../../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../../../utils/logger';
import { readFileSync } from 'fs';
import { getDataModelVersionsHandler } from '../../utils';
import { CreateDataModelVersionDTO } from '@platypus/platypus-core';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'Api external ID',
    prompt: 'Enter the api external ID',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 data-models api versions publish --externalId=MyApi',
  },
  {
    name: 'file',
    description: 'Schema file path',
    prompt: 'Where is the graphql schema file you want to publish located?',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 data-models api versions publish --file=./file.graphql',
  },
  {
    name: 'bindings',
    description: 'Schema Bindings file path',
    prompt:
      'Where is the JSON file containing your data model bindings located?',
    type: CommandArgumentType.STRING,
    required: false,
    example: '$0 data-models api versions publish --bindings=./bindings.json',
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
    example: '$0 data-models api versions publish --conflictMode=NEW_VERSION',
  },
  {
    name: 'apiVersion',
    description: 'Api Version',
    prompt: 'Enter the API version in case if you want to update',
    type: CommandArgumentType.STRING,
    required: false,
    example: '$0 data-models api versions publish --apiVersion=1',
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('solutions:api:versions:publish');

export class CreateApiSpecVersionCommand extends CLICommand {
  async execute(args) {
    const { conflictMode, externalId, apiVersion, bindings } = args;

    const dataModelVersionsHandler = getDataModelVersionsHandler();
    DEBUG('DataModelVersionsHandler initialized');

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
      externalId: externalId,
      version: apiVersion,
      bindings: schemaBindings,
    } as CreateDataModelVersionDTO;

    let response;
    try {
      dataModelVersionsHandler.publish(dto, conflictMode);
    } catch (err) {
      console.log(err);
      throw err;
    }

    if (!response.isSuccess) {
      throw response.error;
    }

    DEBUG(
      'Api version published successfully, %o',
      JSON.stringify(response.getValue(), null, 2)
    );
    Response.log(`Api version published successfully`);
  }
}

export default new CreateApiSpecVersionCommand(
  'publish',
  'Publish API Schema Version',
  commandArgs
);
