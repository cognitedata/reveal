import { SolutionsApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../../../utils/cogniteSdk';
import { CommandArgument, CommandArgumentType } from '../../../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../../../utils/logger';
import { readFileSync } from 'fs';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'ApiSpec ExternalId',
    prompt: 'Enter unique ExternalId for the ApiSpec',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      '$0 solutions apiSpec versions create --externalId=test-id --file=./file.graphql',
  },
  {
    name: 'file',
    description: 'Schema file path',
    prompt:
      'Please specify the the path to the schema file that you want to publish',
    type: CommandArgumentType.STRING,
    required: true,
  },
] as CommandArgument[];

export class CreateApiSpecVersionCommand extends CLICommand {
  async execute(args) {
    const client = getCogniteSDKClient();
    _DEBUG('CDF Clint initialized');

    const solutionSchemaApi = new SolutionsApiService(client);
    _DEBUG('SolutionsApiService initialized');

    _DEBUG('Reading specified graphql file');
    const graphqlSchema = readFileSync(args.file, {
      encoding: 'utf-8',
    }).toString();

    _DEBUG('Schema contents %o', graphqlSchema);

    const response = await solutionSchemaApi.addApiSpecVersion(
      args.externalId,
      graphqlSchema
    );

    _DEBUG(
      'ApiSpec version was created successfully, %o',
      JSON.stringify(response, null, 2)
    );
    Response.log(`The ApiSpec version was created successfully`);
  }
}

export default new CreateApiSpecVersionCommand(
  'create',
  'Create ApiSpec version',
  commandArgs
);
