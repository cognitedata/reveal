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

const DEBUG = _DEBUG.extend('data-models:storage:spaces:delete');

export const commandArgs = [
  {
    name: 'externalId',
    description: 'Data model storage space external ID',
    prompt: 'Enter storage space external ID',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 spaces delete --externalId=MySpace',
  },
] as CommandArgument[];

type DMSSpacesDeleteCommandArgs = BaseArgs & {
  externalId: string;
};

export class DMSSpacesDeleteCommand extends CLICommand {
  async execute(args: Arguments<DMSSpacesDeleteCommandArgs>) {
    const storageApiService = getDataModelStorageApiService();
    DEBUG('storageApiService initialized');

    const apiResponse = await storageApiService.deleteSpaces([
      {
        externalId: args.externalId,
      },
    ]);

    DEBUG(
      'Space has been deleted successfully, %o',
      JSON.stringify(apiResponse, null, 2)
    );

    Response.success(JSON.stringify(apiResponse, null, 2));
  }
}

export default new DMSSpacesDeleteCommand(
  'delete',
  'Delete spaces from storage',
  commandArgs
);
