import { TemplatesApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';
import { injectRCFile } from '../../common/config';
import { Arguments } from 'yargs';
import { unlink } from 'fs/promises';
import { CONSTANTS } from '../../constants';
import { join } from 'path';
import { cwd } from 'process';

export const command = 'delete';

export const desc = 'Delete a template group';

const DEBUG = _DEBUG.extend('templates:delete');

export type DeleteTemplateGroupCommandArgs = BaseArgs & {
  ['confirm']: boolean;
};

export const commandArgs = [
  {
    name: 'confirm',
    description: 'Do not ask for confirmation',
    prompt: 'Are you sure you want to delete this template group?',
    type: CommandArgumentType.BOOLEAN,
    required: true,
    example: '$0 templates delete --confirm',
  },
] as CommandArgument[];

export class DeleteTemplateGroupCommand extends CLICommand {
  @injectRCFile()
  async execute(args: Arguments<DeleteTemplateGroupCommandArgs>) {
    try {
      const id = args.solutionConfig.all.config.templateId;
      if (args.confirm) {
        DEBUG`Deleting template group ${id}`;

        const client = getCogniteSDKClient();
        DEBUG`CDF Client Initialized`;

        const templatesApi = new TemplatesApiService(client);
        DEBUG`Templates API Initialized`;

        await templatesApi.deleteTemplateGroup({
          id,
        });
        DEBUG`Template group deleted successfully`;

        Response.log(`Deleted the template group "${id}" successfully.`);

        unlink(join(cwd(), CONSTANTS.PROJECT_CONFIG_FILE_NAME)).catch((err) => {
          DEBUG`${err}`;
          Response.error('Failed to delete the project config file');
        });
      }
    } catch (error) {
      DEBUG`${error}`;
      Response.error(`Failed to delete template group: ${error.message}`);
    }
  }
}

export default new DeleteTemplateGroupCommand(command, desc, commandArgs);
