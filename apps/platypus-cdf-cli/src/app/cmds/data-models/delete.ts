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

import { getDataModelsHandler } from './utils';

const DEBUG = _DEBUG.extend('data-models:delete');

export const commandArgs = [
  {
    name: 'external-id',
    description: 'The external id of the data model',
    prompt: 'Enter the data model external id',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      'cdf data-models delete --external-id="Testing-DM"   Deletes a data model with the external-id "Testing-DM"',
  },
] as CommandArgument[];

type DataModelDeleteCommandArgs = BaseArgs & {
  'external-id': string;
};

export class DeleteCmd extends CLICommand {
  async execute(args: Arguments<DataModelDeleteCommandArgs>) {
    const dataModelsHandler = getDataModelsHandler();
    DEBUG('dataModelsHandler initialized');

    const response = await dataModelsHandler.delete({
      id: args['external-id'],
    });

    if (!response.isSuccess) {
      throw response.error;
    }

    DEBUG(
      'Data model was created successfully, %o',
      JSON.stringify(response.getValue(), null, 2)
    );
    Response.success(
      `Data model - "${args['external-id']}" has been deleted successfully`
    );
  }
}

export default new DeleteCmd(
  'delete',
  'Deletes a data model stored in CDF (including all its data and versions). This is an irreversible action!',
  commandArgs
);
