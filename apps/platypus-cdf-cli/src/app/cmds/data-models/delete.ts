import {
  DeleteDataModelCommand,
  FetchDataModelQuery,
} from '@fusion/data-modeling';
import { DataModelDTO } from '@platypus-core/domain/data-model/providers/fdm-next/dto/dms-data-model-dtos';
import { Arguments } from 'yargs';

import { CLICommand } from '../../common/cli-command';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../types';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import Response, { DEBUG as _DEBUG } from '../../utils/logger';

import { getFdmV3MixerApiService } from './utils';

const DEBUG = _DEBUG.extend('data-models:delete');

export const commandArgs = [
  {
    name: 'external-id',
    description: 'The external id of the data model.',
    prompt: 'Enter the data model external ID',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      'cdf data-models delete --external-id="Testing-DM" --space="abc"  Deletes a data model with the external-id "Testing-DM"',
  },
  {
    name: 'space',
    description:
      'Space id of the space the data model should belong to. Defaults to same as external-id.',
    type: CommandArgumentType.STRING,
    required: true,
    prompt: 'Enter data model space ID',
    promptDefaultValue: (commandArgs) => commandArgs['external-id'],
  },
  {
    name: 'deleteTypes',
    description:
      "Also deletes the data types if they are not imported by other data models. However, If there's data types imported by data models you dont have access to, they will still be deleted!",
    type: CommandArgumentType.BOOLEAN,
  },
] as CommandArgument[];

type DataModelDeleteCommandArgs = BaseArgs & {
  'external-id': string;
  space: string;
  deleteTypes: boolean;
};

export class DeleteCmd extends CLICommand {
  async execute(args: Arguments<DataModelDeleteCommandArgs>) {
    const mixerApiService = getFdmV3MixerApiService();

    const deleteCommand = DeleteDataModelCommand.create(getCogniteSDKClient());
    const fetchDataModelQuery = new FetchDataModelQuery(mixerApiService);

    DEBUG('fetchDataModelQuery initialized');

    Response.info(
      `Deleting "${args['external-id']}". This can take a few minutes...`
    );

    let dataModelResponse;
    try {
      // eslint-disable-next-line
      dataModelResponse = await fetchDataModelQuery.execute({
        dataModelId: args['external-id'],
        space: args.space,
      });
    } catch {
      Response.error('The data model specified does not exist.');
      return;
    }

    const response = await deleteCommand.execute(
      {
        externalId: args['external-id'],
        space: args['space'],
      },
      args['deleteTypes'] || false
    );

    const { referencedViews } = response;

    DEBUG(
      'Data model was created successfully, %o',
      JSON.stringify(response, null, 2)
    );
    Response.success(
      `Data model "${args['external-id']}" has been deleted successfully`
    );
    if (args['deleteTypes'] && referencedViews && referencedViews.length) {
      Response.info(
        `However, some data types were kept because they are still used by other data models.
${referencedViews
  .map(
    (el) =>
      `> ${el.externalId}, used by:\n  - ${el.dataModels
        .map(formatDataModelString)
        .join('\n  - ')}`
  )
  .join('\n')}`
      );
    }
  }
}

const formatDataModelString = (dataModel: DataModelDTO) => {
  return `${dataModel.name || 'no name'} <${dataModel.externalId}> (${
    dataModel.space
  })`;
};

export default new DeleteCmd(
  'delete',
  'Delete a data model. Delete all unreferenced and unused data types within the data model. This is an irreversible action!',
  commandArgs
);