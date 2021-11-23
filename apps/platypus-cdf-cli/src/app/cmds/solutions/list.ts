import { Arguments, CommandBuilder } from 'yargs';

import {
  SolutionsHandler,
  SolutionsTemplatesApiService,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { BaseArgs } from '../../types';

export const command = 'list';
export const desc = 'List all solutions for current project';
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

  const solutionsHandler = new SolutionsHandler(
    new SolutionsTemplatesApiService(client)
  );

  const result = await solutionsHandler.list();

  if (!result.isSuccess) {
    return args.logger.error(
      `Failed to list solutions because of ${result.error}`
    );
  }

  if (args.full) {
    args.logger.log(JSON.stringify(result.getValue()));
  } else {
    args.logger.log(
      result
        .getValue()
        .map((solution) => solution.name)
        .join('\n')
    );
  }
}
