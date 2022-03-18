import { CommandArgument, CommandArgumentType } from '../../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../../utils/logger';
import { getSchemaApiService } from '../utils';
import { readFileSync } from 'fs';

export const commandArgs = [
  {
    name: 'file',
    alias: 'f',
    description: 'File that contains the list of the data models to create.',
    prompt:
      'Please specify the the path to the file that contains the list of the data models you want to create.',
    type: CommandArgumentType.STRING,
    required: true,
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('solutions:storage:upsert');
export class UpsertStorageCommand extends CLICommand {
  async execute(args) {
    const solutionsApiService = getSchemaApiService();
    DEBUG('SolutionsApiService initialized');

    DEBUG('Reading specified file');

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

    const response = await solutionsApiService.upsertStorage(payload);

    DEBUG(
      'The data models storage was created/updated successfully, %o',
      JSON.stringify(response, null, 2)
    );
    Response.success(`Request was completed successfully`);
  }
}

export default new UpsertStorageCommand(
  'upsert',
  'Create or update storage',
  commandArgs
);
