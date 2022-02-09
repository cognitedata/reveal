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
    description: 'Table ExternalId',
    prompt: 'Enter the table External Id',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      '$0 solutions storage ingest --externalId=Person --file=./file-name',
  },
  {
    name: 'file',
    description: 'The path to the file with JSON data',
    prompt:
      'Please specify the the path to the file that contains the JSON data you want to ingest',
    type: CommandArgumentType.STRING,
    required: true,
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('platypus-cdf-cli:solutions:storage:ingest');
export class IngestApiStorageCommand extends CLICommand {
  async execute(args) {
    const client = getCogniteSDKClient();
    DEBUG('CDF Clint initialized');

    const solutionSchemaApi = new SolutionsApiService(client);
    DEBUG('SolutionsApiService initialized');

    let dataToIngest;
    _DEBUG('Reading specified file');
    dataToIngest = readFileSync(args.file, {
      encoding: 'utf-8',
    }).toString();

    dataToIngest = JSON.parse(dataToIngest);

    _DEBUG('File contents %o', dataToIngest);

    const hasValidStruct = (arr, target) =>
      target.every((v) => arr.includes(v));

    if (
      !Array.isArray(dataToIngest) ||
      !dataToIngest.some((rowStruct) =>
        hasValidStruct(Object.keys(rowStruct), ['externalId', 'values'])
      )
    ) {
      const exampleUsage = `
      [
        {
          "externalId": "TableExternalId",
          "values": {
            "address": "Some Address",
          }
        }
      ]
      `;
      Response.error(`Invalid data structure was provided. Example:
      ${exampleUsage}
      `);
      return;
    }

    _DEBUG('Preparing to ingest data');

    const response = await solutionSchemaApi.ingestData({
      externalId: args.externalId,
      data: dataToIngest,
    });

    DEBUG(
      'Data was ingested successfully, %o',
      JSON.stringify(response, null, 2)
    );
    Response.log(
      `Api storage for - "${args.externalId}" was published successfully`
    );
  }
}

export default new IngestApiStorageCommand(
  'ingest',
  'Ingest data into storage',
  commandArgs
);
