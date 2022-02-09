import { SolutionsApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../../utils/cogniteSdk';
import { CommandArgument, CommandArgumentType } from '../../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../../utils/logger';
import { readFileSync } from 'fs';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'ApiSpec ExternalId',
    prompt: 'Enter unique ExternalId for the ApiSpec',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      '$0 solutions apis publish --externalId=test-id --file=./file-name',
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

const DEBUG = _DEBUG.extend('platypus-cdf-cli:solutions:api:publish');
export class PublishApiCommand extends CLICommand {
  async execute(args) {
    const client = getCogniteSDKClient();
    DEBUG('CDF Clint initialized');

    const solutionSchemaApi = new SolutionsApiService(client);
    DEBUG('SolutionsApiService initialized');

    let solutionApi;

    _DEBUG('Reading specified file');
    solutionApi = readFileSync(args.file, {
      encoding: 'utf-8',
    }).toString();

    solutionApi = JSON.parse(solutionApi);

    _DEBUG('File contents %o', solutionApi);

    const hasValidStruct = (arr, target) =>
      target.every((v) => arr.includes(v));

    if (
      Array.isArray(solutionApi) ||
      !hasValidStruct(Object.keys(solutionApi), [
        'externalId',
        'apiSpecReference',
        'bindings',
      ])
    ) {
      const exampleUsage = `
        {
          "externalId": "ExternalId",
          "apiSpecReference": {
            "externalId": "apiSpecExternalId",
            "version": 1
          },
          "bindings": [{
            "targetName": "TargetName",
            "tableDataSource": {
              "externalId": "TableExternalId"
            }
          }]
        }

      `;
      Response.error(`Invalid or empty config for APIs was provided. Example:
      ${exampleUsage}
      `);
      return;
    }

    const response = await solutionSchemaApi.updateApis([solutionApi]);

    DEBUG('Api was saved successfully, %o', JSON.stringify(response, null, 2));
    Response.log(`Api - "${args.externalId}" was published successfully`);
  }
}

export default new PublishApiCommand(
  'publish',
  'Create or update api',
  commandArgs
);
