import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import { DEBUG as _DEBUG } from '@cognite/platypus-cdf-cli/app/utils/logger';
import Table from 'cli-table3';

import { Argv } from 'yargs';

import { getDataModelsHandler } from './utils';

const DEBUG = _DEBUG.extend('data-models:list');

export class ListCmd extends CLICommand {
  builder<T>(yargs: Argv<T>): Argv {
    yargs.usage('List all data models in CDF');

    return super.builder(yargs);
  }

  async execute() {
    const dataModelsHandler = getDataModelsHandler();
    DEBUG('dataModelsHandler initialized');

    const response = await dataModelsHandler.list();

    if (!response.isSuccess) {
      throw response.error;
    }

    DEBUG(
      'Data model list retrieved successfully, %o',
      JSON.stringify(response.getValue(), null, 2)
    );

    // Pagination here will be improved later
    // https://cognitedata.atlassian.net/browse/DX-869
    const dataModelList = response.getValue();

    let table = new Table({
      head: ['name', 'external-id', 'space', 'version'],
    });

    for (let i = 0; i < 1000 && i < dataModelList.length; i++) {
      const item = dataModelList[i];
      table.push([
        item.name ?? '',
        item.id ?? '',
        item.space ?? '',
        item.version ?? '',
      ]);
    }

    console.log(table.toString());
  }
}

export default new ListCmd('list', 'List data models.', []);
