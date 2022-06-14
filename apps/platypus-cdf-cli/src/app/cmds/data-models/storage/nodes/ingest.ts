import { CommandArgument, CommandArgumentType } from '../../../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../../../utils/logger';
import { getDataModelStorageApiService } from '../../utils';
import { readFileSync } from 'fs';

export const commandArgs = [
  {
    name: 'file',
    alias: 'f',
    description: 'Path to the JSON file containing the data to ingest',
    prompt:
      'Where is the JSON file containing the data you want to ingest located?',
    type: CommandArgumentType.STRING,
    required: true,
  },
  {
    name: 'view',
    description: 'View data as LIST or JSON',
    prompt: 'How do you want to view the data?',
    type: CommandArgumentType.SELECT,
    options: {
      choices: ['LIST', 'JSON'],
    },
    required: false,
    example: '$0 nodes ingest --view=JSON',
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('data-models:storage:nodes:ingest');
export class DMSNodesIngestCmd extends CLICommand {
  async execute(args) {
    const dmsApiService = getDataModelStorageApiService();
    DEBUG('DataModelStorageApiService initialized');
    DEBUG('Reading specified file');
    let payload;
    try {
      DEBUG('Reading specified file');
      payload = readFileSync(args.file, {
        encoding: 'utf-8',
      }).toString();
      payload = JSON.parse(payload);
    } catch (ex) {
      DEBUG(JSON.stringify(ex, null, 2));
      Response.error(args.verbose ? JSON.stringify(ex, null, 2) : ex.message);
      throw ex;
    }
    DEBUG('File contents %o', payload);
    const response = await dmsApiService.ingestNodes(payload);
    DEBUG(
      'The data was ingested successfully, %o',
      JSON.stringify(response, null, 2)
    );
    Response.success(`Request was completed successfully`);
  }
}

export default new DMSNodesIngestCmd(
  'ingest',
  'Ingest data into storage model',
  commandArgs
);
