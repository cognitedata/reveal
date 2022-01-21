import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';

import { Answers } from 'inquirer';

import { ExpandedActionType } from '../types';

import { TEMPLATES, MARKERS } from './app-templates';
import { ROOT, APP_SERVICES_CFG_PATH } from './constants';

export const appActions: ExpandedActionType[] = [
  {
    type: 'copyMany',
    base: path.join(ROOT, 'apps', 'react-demo-app'),
    destination: path.join(ROOT, 'apps', '{{ name }}'),
    ignore: ['build', 'coverage', 'node_modules'],
    transform: (str: string, data: any) => {
      return str
        .replace(/react-demo-app/g, data.name)
        .replace(
          /staging_app_id = "fas-demo"/g,
          `staging_app_id = "${data.name}-staging"`
        )
        .replace(/fas-demo-prod/g, data.name)
        .replace(/fas-demo/g, data.name)
        .replace(/React Demo \(staging\)/g, data.fullName);
    },
  },
  {
    type: 'addLibrary',
    base: path.join(ROOT, 'apps', '{{ name }}'),
  },
  {
    type: 'addMany',
    destination: APP_SERVICES_CFG_PATH,
    base: path.join(ROOT, 'generators', 'generator', 'modifications'),
    templateFiles: [
      path.join(ROOT, 'generators', 'generator', 'modifications', '**/*'),
    ],
    skip: (answer: Answers) => {
      return (
        !answer.appServicesRegister &&
        'No modifications to `application-services`\n' +
          'You probably still have to modify the repository manually'
      );
    },
  },
  {
    type: 'modify',
    path: path.join(
      APP_SERVICES_CFG_PATH,
      'kubecfg',
      'production',
      'apps',
      'main.libsonnet'
    ),
    pattern: MARKERS.DOMAINS_IMPORT,
    template: TEMPLATES.DOMAINS_IMPORT,
    skip: (answer: Answers) => {
      return (
        !answer.appServicesRegister &&
        'No modifications to `application-services`\n' +
          'You probably still have to modify the repository manually'
      );
    },
  },
  {
    type: 'modify',
    path: path.join(
      APP_SERVICES_CFG_PATH,
      'kubecfg',
      'production',
      'apps',
      'main.libsonnet'
    ),
    pattern: MARKERS.DOMAINS_IMPORT_SECOND,
    template: TEMPLATES.DOMAINS_IMPORT_SECOND,
    skip: (answer: Answers) => {
      return (
        !answer.appServicesRegister &&
        'No modifications to `application-services`\n' +
          'You probably still have to modify the repository manually'
      );
    },
  },
  {
    type: 'modify',
    path: path.join(
      APP_SERVICES_CFG_PATH,
      'kubecfg',
      'staging',
      'apps',
      'main.libsonnet'
    ),
    pattern: MARKERS.DOMAINS_IMPORT,
    template: TEMPLATES.DOMAINS_IMPORT,
    skip: (answer: Answers) => {
      return (
        !answer.appServicesRegister &&
        'No modifications to `application-services`\n' +
          'You probably still have to modify the repository manually'
      );
    },
  },
  {
    type: 'modify',
    path: path.join(
      APP_SERVICES_CFG_PATH,
      'kubecfg',
      'staging',
      'apps',
      'main.libsonnet'
    ),
    pattern: MARKERS.DOMAINS_IMPORT_SECOND,
    template: TEMPLATES.DOMAINS_IMPORT_SECOND,
    skip: (answer: Answers) => {
      return (
        !answer.appServicesRegister &&
        'No modifications to `application-services`\n' +
          'You probably still have to modify the repository manually'
      );
    },
  },

  {
    type: 'modify',
    path: path.join(
      APP_SERVICES_CFG_PATH,
      'kubecfg',
      'production',
      'domains',
      'main.libsonnet'
    ),
    pattern: MARKERS.MODIFY_DOMAINS,
    template: TEMPLATES.MODIFY_DOMAINS,
    skip: (answer: Answers) => {
      return (
        !answer.appServicesRegister &&
        'No modifications to `application-services`\n' +
          'You probably still have to modify the repository manually'
      );
    },
  },
  {
    type: 'modify',
    path: path.join(
      APP_SERVICES_CFG_PATH,
      'kubecfg',
      'staging',
      'domains',
      'main.libsonnet'
    ),
    pattern: MARKERS.MODIFY_DOMAINS_STAGING,
    template: TEMPLATES.MODIFY_DOMAINS_STAGING,
    skip: (answer: Answers) => {
      return (
        !answer.appServicesRegister &&
        'No modifications to `application-services`\n' +
          'You probably still have to modify the repository manually'
      );
    },
  },

  {
    type: 'disableIntercom',
    path: path.join(ROOT, 'apps', '{{ name }}'),
    skip: (answer: Answers) => {
      return !answer.disableIntercom && 'Intercom is enabled';
    },
  },

  function customAction(answers: Answers): string {
    const source = path.join(ROOT, 'apps', answers.name, 'private-keys');

    if (!fs.existsSync(source)) {
      return 'No file to rename';
    }
    fs.readdirSync(source).forEach((filePath) => {
      if (filePath.includes('react-demo-app')) {
        fs.renameSync(
          path.join(source, filePath),
          path.join(source, filePath.replace('react-demo-app', answers.name))
        );
      }
    });
    return 'Renamed secret key';
  },

  function customAction(): string {
    execSync('bazel run //:buildifier');
    return 'Cleaned BUILD.bazel';
  },
];

type PromptReturnType = string | boolean;
export const appSteps = [
  {
    type: 'input',
    name: 'name',
    message: 'What is the name of this application?',
    validate: (input: string): PromptReturnType => {
      if (input.toLowerCase() !== input) {
        return 'Name should be lower case';
      }

      if (!input.match(/^[a-z0-9-]+$/)) {
        return 'Name should look like: foo-bar';
      }

      return true;
    },
    when: (data?: Answers): boolean =>
      data !== undefined && data.type === 'app',
  },
  {
    type: 'input',
    name: 'fullName',
    message: 'What is the full readable name of this app?',
    when: (data?: Answers): boolean =>
      data !== undefined && data.type === 'app',
  },
  {
    type: 'list',
    name: 'testLibrary',
    message: 'Which testing library do you want your app to use?',
    choices: [
      {
        short: 'Cypress',
        name: 'Cypress library',
        value: 'cypress',
      },
      {
        short: 'None',
        name: 'No Library',
        value: 'none',
      },
    ],
    when: (data?: Answers): boolean =>
      data !== undefined && data.type === 'app',
  },
  {
    type: 'list',
    name: 'appServicesRegister',
    message:
      'Do you want to register your app in `application-services`?\n' +
      '(You need to have the repository at the same level as `applications`)',
    choices: [
      {
        short: 'True',
        name: 'Yes',
        value: true,
      },
      {
        short: 'False',
        name: 'No',
        value: false,
      },
    ],
    when: (data?: Answers): boolean =>
      data !== undefined && data.type === 'app',
  },

  {
    type: 'list',
    name: 'disableIntercom',
    message: 'Do you want to disable intercom?',
    choices: [
      {
        short: 'True',
        name: 'Yes',
        value: true,
      },
      {
        short: 'False',
        name: 'No',
        value: false,
      },
    ],
    when: (data?: Answers): boolean =>
      data !== undefined && data.type === 'app',
  },
];
