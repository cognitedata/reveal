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

const DEBUG = _DEBUG.extend('data-models:storage:models:list');

export const commandArgs = [
  {
    name: 'spaceExternalId',
    description: 'Data model space external ID',
    prompt: 'Enter data model external space ID',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 models list --spaceExternalId=MySpace',
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
    example: '$0 models list --view=JSON',
  },
] as CommandArgument[];

type DataModelStorageListCommandArgs = BaseArgs & {
  view: string;
  spaceExternalId: string;
};

export class DataModelStorageModelsListCommand extends CLICommand {
  async execute(args: Arguments<DataModelStorageListCommandArgs>) {
    const storageApiService = getDataModelStorageApiService();
    DEBUG('storageApiService initialized');

    const apiResponse = await storageApiService.listModels({
      spaceExternalId: args.spaceExternalId,
    });

    DEBUG(
      'List of models retrieved successfully, %o',
      JSON.stringify(apiResponse, null, 2)
    );

    if (args.view === 'JSON') {
      Response.success(JSON.stringify(apiResponse, null, 2));
    } else {
      if (!apiResponse.length) {
        Response.success('No models have been created in this project(space)');
      } else {
        Response.success(apiResponse.map((item) => item.externalId).join('\n'));
      }
    }
  }
}

export default new DataModelStorageModelsListCommand(
  'list',
  'List models in storage',
  commandArgs
);
