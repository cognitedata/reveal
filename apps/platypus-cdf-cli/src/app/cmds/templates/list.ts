import { Arguments, CommandBuilder } from 'yargs';
import { BaseArgs } from '../../types';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

export const command = 'list';
export const desc = 'List all templates for current project';
export const builder: CommandBuilder = {
  full: {
    description: 'add --full for the full schema including generated types',
    default: false,
    type: 'boolean',
  },
  type: {
    description: 'see just a specific type',
    type: 'array',
  },
};

export async function handler(args: Arguments<BaseArgs>) {
  const client = getCogniteSDKClient();

  const templates = await client.templates.groups.list();

  if (args.full) {
    args.logger.log(JSON.stringify(templates.items));
  }

  args.logger.log(
    templates.items.map((template) => template.externalId).join('\n')
  );
}
