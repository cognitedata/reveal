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

import { getDataModelStorageApiService } from '../../utils';

const DEBUG = _DEBUG.extend('data-models:storage:spaces:list');

export const commandArgs = [
  {
    name: 'view',
    description: 'View data as LIST or JSON',
    prompt: 'How do you want to view the data?',
    type: CommandArgumentType.SELECT,
    options: {
      choices: ['LIST', 'JSON'],
    },
    required: false,
    example: '$0 data-model storage list --view=JSON',
  },
] as CommandArgument[];

type DMSSpacesListCommandArgs = BaseArgs & {
  view: string;
};

export class DMSSpacesListCommand extends CLICommand {
  async execute(args: Arguments<DMSSpacesListCommandArgs>) {
    const storageApiService = getDataModelStorageApiService();
    DEBUG('storageApiService initialized');

    const apiResponse = await storageApiService.listSpaces();

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

export default new DMSSpacesListCommand(
  'list',
  'List spaces in storage',
  commandArgs
);
