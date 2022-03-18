import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import {
  BaseArgs,
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';
import { readFileSync } from 'fs';
import { Arguments } from 'yargs';

import { getSchemaApiService } from '../utils';

const DEBUG = _DEBUG.extend('solutions:storage:list');

export const commandArgs = [
  {
    name: 'file',
    alias: 'f',
    description: 'File that contains the request payload',
    prompt:
      'Please specify the the path to the file that contains the request payload',
    type: CommandArgumentType.STRING,
    required: true,
  },
] as CommandArgument[];

type SolutionsStorageListInstancesCommandArgs = BaseArgs & {
  file: string;
  view: string;
};

export class SolutionsStorageListInstancesCommand extends CLICommand {
  async execute(args: Arguments<SolutionsStorageListInstancesCommandArgs>) {
    const solutionsApiService = getSchemaApiService();
    DEBUG('SolutionsApiService initialized');

    let payload;
    try {
      DEBUG('Reading specified file');
      payload = readFileSync(args.file, {
        encoding: 'utf-8',
      }).toString();
      payload = JSON.parse(payload);
    } catch (ex) {
      DEBUG(JSON.stringify(ex, null, 2));
      Response.error(args.verbose ? JSON.stringify(ex, null, 2) : ex.message);
      throw ex;
    }

    DEBUG('File contents %o', payload);

    const apiResponse = await solutionsApiService.listStorageInstances(payload);

    DEBUG(
      'List of instances retrieved successfully, %o',
      JSON.stringify(apiResponse, null, 2)
    );

    Response.success(JSON.stringify(apiResponse, null, 2));
  }
}

export default new SolutionsStorageListInstancesCommand(
  'list-instances',
  'List data model instances (ingested data) for a project',
  commandArgs
);
