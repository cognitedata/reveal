import { TemplatesApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';
import { Arguments } from 'yargs';

const DEBUG = _DEBUG.extend('cmds:templates:create');

export type TemplateInitCommandArgs = BaseArgs & {
  ['external-id']: string;
  ['description']?: string;
  ['owner']?: string;
};

export const commandArgs: CommandArgument[] = [
  {
    name: 'external-id',
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
];

export class CreateTemplateGroupCommand extends CLICommand {
  async execute(args: Arguments<TemplateInitCommandArgs>) {
    const client = getCogniteSDKClient();
    DEBUG('CDF Client initialized');
    const templatesApi = new TemplatesApiService(client);
    DEBUG('Templates API service initialized');
    await templatesApi.createTemplateGroup({
      name: args['external-id'],
      description: args.description,
      owner: args.owner,
    });
    DEBUG('Template group created');
    Response.success(
      `Template group "${args.externalId}" is created successfully`
    );
  }
}

export default new CreateTemplateGroupCommand(
  'create',
  'Create a template group',
  commandArgs
);
