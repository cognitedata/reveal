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

const DEBUG = _DEBUG.extend('data-models:storage:models:delete');

export const commandArgs = [
  {
    name: 'spaceExternalId',
    description: 'Data model space external ID',
    prompt: 'Enter data model space external ID',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 models delete --spaceExternalId=MySpace',
  },
  {
    name: 'modelExternalId',
    description: 'Model external ID',
    prompt: 'Enter the model external ID',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 models delete --modelExternalId=MyModel',
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
    example: '$0 models delete --view=JSON',
  },
] as CommandArgument[];

type DMSStorageModelsDeleteCommandArgs = BaseArgs & {
  view: string;
  spaceExternalId: string;
  modelExternalId: string;
};

export class DataModelStorageModelsDeleteCommand extends CLICommand {
  async execute(args: Arguments<DMSStorageModelsDeleteCommandArgs>) {
    const storageApiService = getDataModelStorageApiService();
    DEBUG('storageApiService initialized');

    const response = await storageApiService.deleteModel({
      spaceExternalId: args.spaceExternalId,
      items: [{ externalId: args.modelExternalId }],
    });

    DEBUG('Model deleted successfully, %o', JSON.stringify(response, null, 2));

    if (args.view === 'JSON') {
      Response.success(JSON.stringify(response, null, 2));
    } else {
      Response.success(`Request was completed successfully`);
    }
  }
}

export default new DataModelStorageModelsDeleteCommand(
  'delete',
  'Delete models in storage',
  commandArgs
);
