import { TemplatesApiService } from '@platypus/platypus-core';
import { Arguments } from 'yargs';
import {
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import { getCogniteSDKClient } from '@cognite/platypus-cdf-cli/app/utils/cogniteSdk';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';

export const command = 'list';
export const desc = 'Retrieves a list of versions sorted in descending order.';

export const commandArgs = [
  {
    name: 'externalId',
    description: 'The external ID of the template group.',
    prompt: 'Enter the template group externalId',
    type: CommandArgumentType.STRING,
    required: true,
    example: '$0 templates versions list --externalId=some-external-id --full',
  },
  {
    name: 'full',
    description: 'add --full for the full schema including generated types',
    prompt: 'Do you want to see the response as JSON',
    type: CommandArgumentType.BOOLEAN,
    initial: false,
  },
] as CommandArgument[];

export class TemplatesVersionsListCommand extends CLICommand {
  async execute(args: Arguments<any>) {
    const client = getCogniteSDKClient();
    const templatesApi = new TemplatesApiService(client);

    const versions = await templatesApi.listSchemaVersions({
      solutionId: args.externalId,
    });

    if (!versions || !versions.length) {
      Response.error(
        'There are no schemas created for this template group. Please create one!'
      );
      return;
    }

    if (args.full === true) {
      Response.log(JSON.stringify(versions, null, 2));
      return;
    }

    Response.log(versions.map((item) => item.version.toString()).join('\n'));
  }
}

export default new TemplatesVersionsListCommand(command, desc, commandArgs);
