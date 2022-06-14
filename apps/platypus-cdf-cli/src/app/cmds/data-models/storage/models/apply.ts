import { CommandArgument, CommandArgumentType } from '../../../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../../../utils/logger';
import { getDataModelStorageApiService } from '../../utils';
import { readFileSync } from 'fs';

export const commandArgs = [
  {
    name: 'file',
    alias: 'f',
    description: 'Path to JSON file containing your data models',
    prompt:
      'Where is the JSON file containing the data models you want to apply located?',
    type: CommandArgumentType.STRING,
    required: true,
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
    example: '$0 models apply --view=JSON',
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('data-models:storage:models:apply');
export class ApplyDataModelCommand extends CLICommand {
  async execute(args) {
    const dmsApiService = getDataModelStorageApiService();
    DEBUG('DataModelStorageApiService initialized');
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
    const response = await dmsApiService.upsertModel(payload);
    DEBUG(
      'The data models storage was created/updated successfully, %o',
      JSON.stringify(response, null, 2)
    );

    if (args.view === 'JSON') {
      Response.success(JSON.stringify(response, null, 2));
    } else {
      Response.success(`Request was completed successfully`);
    }
  }
}

export default new ApplyDataModelCommand(
  'apply',
  'Create or update models in storage',
  commandArgs
);
