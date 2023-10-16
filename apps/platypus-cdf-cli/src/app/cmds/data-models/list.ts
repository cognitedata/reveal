import { ListDataModelsQuery } from '@fusion/data-modeling';
import Table from 'cli-table3';
import { Arguments } from 'yargs';

import { CLICommand } from '../../common/cli-command';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../types';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { DEBUG as _DEBUG } from '../../utils/logger';

import { getFdmV3MixerApiService } from './utils';

const DEBUG = _DEBUG.extend('data-models:list');
const columns = ['name', 'id', 'space', 'version'];
const columnHeaderMapping = {
  name: 'name',
  space: 'space',
  id: 'external id',
  version: 'version',
};
export const commandArgs = [
  {
    name: 'simple',
    description:
      'Shows a simplified, comma-delimited list instead of a full table. Useful for CI/CD.',
    type: CommandArgumentType.BOOLEAN,
    required: false,
    initial: false,
  },
  {
    name: 'columns',
    description: 'Choose which columns are visible',
    type: CommandArgumentType.MULTI_SELECT,
    options: {
      choices: columns,
    },
    required: false,
    example: 'cdf dm list --columns=id --columns=space',
    initial: columns,
  },
] as CommandArgument[];

type DataModelListCommandArgs = BaseArgs & {
  simple: boolean;
  columns: string[];
};

export class ListCmd extends CLICommand {
  async execute(args: Arguments<DataModelListCommandArgs>) {
    const listDataModelsQry = ListDataModelsQuery.create(getCogniteSDKClient());

    DEBUG('listDataModelsQry initialized');

    const response = await listDataModelsQry.execute();

    DEBUG(
      'Data models list retrieved successfully, %o',
      JSON.stringify(response, null, 2)
    );

    // Pagination here will be improved later
    // https://cognitedata.atlassian.net/browse/DX-869
    const dataModelList = response;
    if (args['simple']) {
      args.logger.log(
        args['columns'].map((el) => columnHeaderMapping[el]).join(',')
      );
      for (let i = 0; i < 1000 && i < dataModelList.length; i++) {
        const item = dataModelList[i];
        args.logger.log(columns.map((column) => item[column]).join(','));
      }
    } else {
      let table = new Table({
        head: args['columns'].map((el) => columnHeaderMapping[el]),
      });

      for (let i = 0; i < 1000 && i < dataModelList.length; i++) {
        const item = dataModelList[i];
        table.push(args['columns'].map((column) => item[column] ?? ''));
      }

      args.logger.log(table.toString());
    }
  }
}

export default new ListCmd('list', 'List data models.', commandArgs);
