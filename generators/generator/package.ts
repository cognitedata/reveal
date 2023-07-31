import path from 'path';

import { Answers } from 'inquirer';

import { ROOT } from './constants';

export const packageActions = [
  {
    type: 'addMany',
    destination: path.join(ROOT, 'packages', '{{ name }}'),
    base: path.join(ROOT, 'packages', '.template'),
    templateFiles: [path.join(ROOT, 'packages', '.template', '**/*')],
    globOptions: {
      dot: true,
    },
  },
];

type PromptReturnType = string | boolean;
export const packageSteps = [
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
    when: (data?: Answers): boolean =>
      data !== undefined && data.type === 'package',
  },
  {
    type: 'input',
    name: 'description',
    message: 'A short package description:',
    when: (data?: Answers): boolean =>
      data !== undefined && data.type === 'package',
  },
];
