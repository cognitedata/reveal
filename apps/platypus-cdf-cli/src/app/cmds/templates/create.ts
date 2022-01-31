import { TemplatesApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { CommandArgument, CommandArgumentType } from '../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'Template group external id',
    prompt: 'Enter unique name for the template group',
    type: CommandArgumentType.STRING,
    required: true,
    example:
      '$0 templates create --externalId=test-id --description="some description" --owner=email-addres@domain.tld',
  },
  {
    name: 'description',
    description: 'Template group description',
    prompt: 'Enter description for your template group',
    type: CommandArgumentType.STRING,
  },
  {
    name: 'owner',
    description: "Template group owner's email address",
    prompt: "Enter template group owner's email address",
    type: CommandArgumentType.STRING,
  },
] as CommandArgument[];

export class CreateTemplateGroupCommand extends CLICommand {
  async execute(args) {
    const client = getCogniteSDKClient();
    const templatesApi = new TemplatesApiService(client);

    await templatesApi.createTemplateGroup({
      name: args.externalId,
      description: args.description,
      owner: args.owner,
    });
    Response.log(`Template group "${args.externalId}" is created successfully`);
  }
}

export default new CreateTemplateGroupCommand(
  'create',
  'Create a template group',
  commandArgs
);
