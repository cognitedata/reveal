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

import { getSchemaApiService } from '../utils';

const DEBUG = _DEBUG.extend('solutions:storage:list');

export const commandArgs = [
  {
    name: 'view',
    description: 'View data as LIST or JSON',
    prompt: 'How do you want to view the data',
    type: CommandArgumentType.SELECT,
    options: {
      choices: ['LIST', 'JSON'],
    },
    required: false,
    example: '$0 solutions storage list --view=JSON',
  },
] as CommandArgument[];

type SolutionsStorageListCommandArgs = BaseArgs & {
  view: string;
};

export class SolutionsStorageListCommand extends CLICommand {
  async execute(args: Arguments<SolutionsStorageListCommandArgs>) {
    const solutionsApiService = getSchemaApiService();
    DEBUG('SolutionsApiService initialized');

    const apiResponse = await solutionsApiService.listStorage();

    DEBUG(
      'List of apis retrieved successfully, %o',
      JSON.stringify(apiResponse, null, 2)
    );

    if (args.view === 'JSON') {
      Response.success(JSON.stringify(apiResponse, null, 2));
    } else {
      Response.success(apiResponse.map((item) => item.externalId).join('\n'));
    }
  }
}

export default new SolutionsStorageListCommand(
  'list',
  'List the storage for the data models in your project',
  commandArgs
);
