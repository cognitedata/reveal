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
    prompt: 'Enter unique ExternalId for the Api',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      '$0 solutions storage publish --externalId=test-id --file=./file-name',
  },
  {
    name: 'file',
    description: 'Storage config file path',
    prompt:
      'Please specify the the path to the storage config file that you want to publish',
    type: CommandArgumentType.STRING,
    required: true,
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('platypus-cdf-cli:solutions:storage:publish');
export class PublishApiStorageCommand extends CLICommand {
  async execute(args) {
    const client = getCogniteSDKClient();
    DEBUG('CDF Clint initialized');

    const solutionSchemaApi = new SolutionsApiService(client);
    DEBUG('SolutionsApiService initialized');

    let storageConfig;
    _DEBUG('Reading specified file');
    storageConfig = readFileSync(args.file, {
      encoding: 'utf-8',
    }).toString();

    storageConfig = JSON.parse(storageConfig);

    _DEBUG('File contents %o', storageConfig);

    const hasValidStruct = (arr, target) =>
      target.every((v) => arr.includes(v));

    if (
      !Array.isArray(storageConfig) ||
      !storageConfig.some((tableConfig) =>
        hasValidStruct(Object.keys(tableConfig), [
          'externalId',
          'name',
          'columns',
        ])
      )
    ) {
      const exampleUsage = `
      [
        {
          "externalId": "externalId",
          "name": "name",
          "columns": {
            "address": "String",
          }
        }
      ]
      `;
      Response.error(`Invalid or empty config for API storage was provided. Example:
      ${exampleUsage}
      `);
      return;
    }

    const response = await solutionSchemaApi.updateTables(storageConfig);

    DEBUG(
      'Api storage was saved successfully, %o',
      JSON.stringify(response, null, 2)
    );
    Response.log(
      `Api storage for - "${args.externalId}" was published successfully`
    );
  }
}

export default new PublishApiStorageCommand(
  'publish',
  'Create or update api storage',
  commandArgs
);
