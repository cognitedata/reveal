import { existsSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import { Arguments, Argv, CommandModule } from 'yargs';
import { askUserForInput } from '../common/prompt';
import { CONSTANTS } from '../constants';
import { BaseArgs } from '../types';
import { getCogniteSDKClient } from '../utils/cogniteSdk';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';
import CreateTemplateGroupCommand from './templates/create';
import { makeCDFRCFile } from '../common/config';

const DEBUG = _DEBUG.extend('cmds:init');

export type TemplateInitCommandArgs = BaseArgs & {
  ['external-id']?: string;
  ['project-version']?: string;
  ['backend']?: string;
  ['new-project']?: boolean;
  ['project-description']?: string;
  ['project-owner']?: string;
};

class TemplateInitCommand implements CommandModule {
  public readonly aliases = ['i'];
  public readonly command = 'init [name]';
  public readonly describe =
    'Initialize an existing template solution from templates backend';
  builder(argv: Argv<TemplateInitCommandArgs>) {
    return argv
      .option('external-id', {
        type: 'string',
        description: 'In which template group this solution belongs to',
      })
      .option('project-version', {
        type: 'string',
        description: 'Version for the template group this will be locked to',
      })
      .option('backend', {
        type: 'string',
        description: 'Which backend to use for initialization of the project',
      })
      .choices('backend', ['templates', 'schema-service'])
      .option('new-project', {
        type: 'boolean',
        description: 'Create a new project',
      });
  }
  async handler(_args: Arguments<TemplateInitCommandArgs>) {
    let args = { ..._args };

    if (existsSync(join(cwd(), CONSTANTS.PROJECT_CONFIG_FILE_NAME))) {
      return _args.logger.error(
        `Config file (${CONSTANTS.PROJECT_CONFIG_FILE_NAME}) already exists in this directory, exiting...`
      );
    }
    // Ask which backend to use
    DEBUG('Asking user for selecting backend to use');
    const { backend } = await askUserForInput<TemplateInitCommandArgs>(_args, [
      {
        name: 'backend',
        message: 'Which backend to use for initialization of the project',
        required: true,
        choices: ['templates', 'schema-service'],
        type: 'autocomplete',
      },
    ]);
    DEBUG(`Backend selected: ${backend}`);
    args = { ...args, backend };

    if (backend === 'schema-service') {
      DEBUG('stopping here, as we are not supporting schema-service yet');
      return _args.logger.warn(
        'Schema service CLI is coming soon!, use templates backend for now, exiting...'
      );
    }

    // Ask if they want to use new project or existing project
    DEBUG('Asking user if they want to use new project or existing project');
    const { 'new-project': newProject } =
      await askUserForInput<TemplateInitCommandArgs>(_args, [
        {
          name: 'new-project',
          message:
            'Start a project from scratch? (by default, use existing project)',
          required: true,
          type: 'confirm',
        },
      ]);
    DEBUG(`New project selected: ${newProject}`);
    args = { ...args, 'new-project': newProject };

    const client = getCogniteSDKClient();
    DEBUG('CDF client initialized');

    if (true === newProject) {
      DEBUG('Calling create project command to create new project');
      await CreateTemplateGroupCommand.handler(args);
      DEBUG('Project created %o', args);
    } else {
      const templates = await client.templates.groups.list();
      DEBUG('Templates list retrieved %o', templates);

      DEBUG('Asking user for selecting template group to use');
      const resp = await askUserForInput<TemplateInitCommandArgs>(_args, [
        {
          name: 'external-id',
          message: 'Please select template id from this list',
          type: 'autocomplete',
          choices: templates.items.map((t) => t.externalId),
          required: true,
        },
      ]);
      DEBUG(`Template selected: ${resp['external-id']}`);

      args = { ...args, ...resp };

      DEBUG(
        'Fetching project versions for the selected project %o',
        resp['external-id']
      );
      const versions = (
        await client.templates.group(args['external-id']).versions.list()
      ).items.map((v) => v.version);
      DEBUG('Project versions retrieved %o', versions);

      if (versions.length > 0) {
        DEBUG('Asking user for selecting project version to use');
        const version = await askUserForInput<TemplateInitCommandArgs>(args, [
          {
            name: 'project-version',
            message: 'Select the version for the template group',
            required: true,
            type: 'autocomplete',
            choices: versions.map((v) => v.toString()),
          },
        ]);
        DEBUG(`Project version selected: ${version['project-version']}`);
        args = { ...args, ...version };
      }

      if (
        args['project-version'] &&
        !versions.includes(parseInt(args['project-version'], 10))
      ) {
        throw new Error(
          `Version ${args['project-version']} does not exist, please make sure you have the right version`
        );
      }
    }
    DEBUG('Writing the config file');
    await makeCDFRCFile(
      args['external-id'],
      args.backend,
      args['project-version']
    );

    DEBUG('DONE');
    Response.success(
      `Solution "${args['external-id']}" is successfully initialized!`
    );
  }
}

export default new TemplateInitCommand();
