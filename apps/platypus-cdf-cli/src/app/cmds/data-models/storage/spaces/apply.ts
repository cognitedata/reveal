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

const DEBUG = _DEBUG.extend('data-models:storage:spaces:apply');

export const commandArgs = [
  {
    name: 'externalId',
    description: 'Storage space ID',
    prompt: 'Enter storage space external ID',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 spaces apply --externalId=MySpace',
  },
] as CommandArgument[];

type DMSSpacesApplyCommandArgs = BaseArgs & {
  externalId: string;
};

export class DMSSpacesApplyCommand extends CLICommand {
  async execute(args: Arguments<DMSSpacesApplyCommandArgs>) {
    const storageApiService = getDataModelStorageApiService();
    DEBUG('storageApiService initialized');

    const apiResponse = await storageApiService.applySpaces([
      {
        externalId: args.externalId,
      },
    ]);

    DEBUG(
      'Space has been applied successfully, %o',
      JSON.stringify(apiResponse, null, 2)
    );

    Response.success(JSON.stringify(apiResponse, null, 2));
  }
}

export default new DMSSpacesApplyCommand(
  'apply',
  'Apply spaces to storage',
  commandArgs
);
