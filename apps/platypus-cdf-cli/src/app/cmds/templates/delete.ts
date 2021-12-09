import { TemplatesApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { CommandArgument, CommandArgumentType } from '../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';

export const command = 'delete';

export const desc = 'Delete a template group';

export const commandArgs = [
  {
    name: 'externalId',
    description:
      'Template group external id to delete (you must have proper permission to execute the same)',
    prompt: 'Enter the template group external id that you want to delete',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 templates delete --externalId=some-external-id',
  },
] as CommandArgument[];

export class DeleteTemplateGroupCommand extends CLICommand {
  async execute(args) {
    const client = getCogniteSDKClient();
    const templatesApi = new TemplatesApiService(client);

    await templatesApi.deleteTemplateGroup({
      id: args.externalId,
    });
    Response.log(
      `Deleted the template group "${args.externalId}" successfully.`
    );
  }
}

export default new DeleteTemplateGroupCommand(command, desc, commandArgs);
