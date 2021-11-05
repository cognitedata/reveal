import { CommandBuilder } from 'yargs';

import {
  SolutionsHandler,
  SolutionsTemplatesApiService,
} from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handler(args: any) {
  const client = getCogniteSDKClient();

  const solutionsHandler = new SolutionsHandler(
    new SolutionsTemplatesApiService(client as any)
  );

  const solutions = await solutionsHandler.list();

  if (args.full) {
    console.log(solutions);
  } else {
    console.log(solutions.map((solution) => solution.name).join('\n'));
  }
}
