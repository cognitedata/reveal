import { TemplatesApiService } from '@platypus/platypus-core';
import { CommandArgument, CommandArgumentType } from '../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';

import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';

export const commandArgs = [
  {
    name: 'full',
    description: 'add --full for the full schema including generated types',
    prompt: 'Do you want to see the response as JSON',
    type: CommandArgumentType.BOOLEAN,
    initial: false,
    example: '$0 templates list --full',
  },
] as CommandArgument[];

export class TemplatesListCommand extends CLICommand {
  async execute(args) {
    const client = getCogniteSDKClient();
    const templatesApi = new TemplatesApiService(client);

    const templates = await templatesApi.listTemplateGroups();

    if (args.full === true) {
      Response.log(JSON.stringify(templates, null, 2));
      return;
    }

    Response.log(templates.map((template) => template.externalId).join('\n'));
  }
}

export default new TemplatesListCommand(
  'list',
  'List all template groups for current project',
  commandArgs
);
