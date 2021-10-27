/* eslint-disable no-console */

import { DynamicActionsFunction, ActionType } from 'node-plop';
import { Answers } from 'inquirer';

import { appActions, appSteps } from './app';
import { packageActions, packageSteps } from './package';
import { LINE } from './constants';

const actions: DynamicActionsFunction = (data?: Answers) => {
  if (!data) {
    throw new Error('Error processing answers.');
  }

  const commonActions: ActionType[] = [];

  const messages = [
    '',
    LINE,
    ' Go ahead and get started with your new app or package:',
    ' Happy hacking! Stop by #frontend for help :)',
    LINE,
  ];

  if (data.type === 'app') {
    messages.push(
      'You can find more information about app registration and the actions executed here:'
    );
    messages.push(
      'https://cognitedata.atlassian.net/wiki/spaces/FAS/pages/1003225162/How+to+deploy+on+Frontend+App+Server+FAS\n'
    );
    messages.push(
      "Don't forget to create PRs for the affected repositories (`application-services`)"
    );
    messages.push(LINE);
  }

  console.log(messages.join('\n'));

  return [
    ...(data.type === 'app' ? [...commonActions, ...appActions] : []),
    ...(data.type === 'package' ? [...commonActions, ...packageActions] : []),
  ];
};

const config = {
  description: 'Create a new app or package',
  prompts: [
    {
      type: 'list',
      name: 'type',
      message: 'Do you want to create a app or a package?',
      choices: [
        {
          short: 'Apps',
          name: 'Create a new app',
          value: 'app',
        },
        {
          short: 'Package',
          name: 'Create a new NPM package',
          value: 'package',
        },
      ],
    },
    ...appSteps,
    ...packageSteps,
  ],

  actions,
};

export default config;
