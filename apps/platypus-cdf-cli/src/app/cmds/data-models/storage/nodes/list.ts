import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import {
  BaseArgs,
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';
import { Arguments } from 'yargs';
import { readFileSync } from 'fs';

import { getDataModelStorageApiService } from '../../utils';

const DEBUG = _DEBUG.extend('data-models:storage:nodes:list');

export const commandArgs = [
  {
    name: 'file',
    alias: 'f',
    description:
      'Path to the JSON file containing the filters you want to apply',
    prompt:
      'Where is the JSON file containing the filters you want to apply located?',
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
    example: '$0 nodes list --view=JSON',
  },
] as CommandArgument[];

type DMSNodesListCommandArgs = BaseArgs & {
  view: string;
  file: string;
};

export class DMSNodesListCommand extends CLICommand {
  async execute(args: Arguments<DMSNodesListCommandArgs>) {
    const storageApiService = getDataModelStorageApiService();
    DEBUG('storageApiService initialized');

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

    const apiResponse = await storageApiService.filterNodes(payload);

    DEBUG(
      'List of nodes retrieved successfully, %o',
      JSON.stringify(apiResponse, null, 2)
    );

    if (args.view === 'JSON') {
      Response.success(JSON.stringify(apiResponse, null, 2));
    } else {
      if (!apiResponse.items.length) {
        Response.success('No nodes have been created in this project(space)');
      } else {
        Response.success(
          apiResponse.items.map((item) => item.externalId).join('\n')
        );
      }
    }
  }
}

export default new DMSNodesListCommand(
  'list',
  'List nodes in storage model',
  commandArgs
);
