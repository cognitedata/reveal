/* eslint-disable no-console */

import path from 'path';

import { DynamicActionsFunction } from 'node-plop';

import { ROOT, LINE } from './constants';

const actions: DynamicActionsFunction = () => {
  const root = path.join(ROOT, 'packages');

  const commonActions = [
    {
      type: 'addMany',
      destination: path.join(root, '{{ name }}'),
      base: path.join(root, '.template'),
      templateFiles: [path.join(root, '.template', '**/*')],
      globOptions: {
        dot: true,
      },
    },
  ];

  const messages = [
    '',
    LINE,
    ' Go ahead and get started with your new service or package:',
    ' Happy hacking! Stop by #frontend for help :)',
    LINE,
  ];

  console.log(messages.join('\n'));

  return [...commonActions];
};

type PromptReturnType = string | boolean;
const config = {
  description: 'Create a new service or package',
  prompts: [
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of this package?',
      validate: (input: string): PromptReturnType => {
        if (input.toLowerCase() !== input) {
          return 'Name should be lower case';
        }

        if (!input.match(/^[a-z0-9-]+$/)) {
          return 'Name should look like: @cognite/foo-bar';
        }

        return true;
      },
      transformer: (input: string): string => `@cognite/${input}`,
    },
    {
      type: 'input',
      name: 'description',
      message: 'A short package description:',
    },
  ],
  actions,
};

export default config;
