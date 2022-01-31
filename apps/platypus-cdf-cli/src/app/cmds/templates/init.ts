import { existsSync, promises } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import { Arguments, Argv, CommandModule } from 'yargs';
import { ConfigSchema } from '../../common/config';
import { askUserForInput } from '../../common/prompt';
import { CONSTANTS } from '../../constants';
import { BaseArgs } from '../../types';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { getProjectConfig } from '../../utils/config';

const { writeFile } = promises;

export type TemplateInitCommandArgs = BaseArgs & {
  ['template-group-id']?: string;
  ['template-version']?: string;
};

class TemplateInitCommand implements CommandModule {
  public readonly command = 'init [name]';
  public readonly describe =
    'Initialize an existing template solution from templates backend';
  builder(argv: Argv<TemplateInitCommandArgs>) {
    return argv
      .option('template-group-id', {
        type: 'string',
        description: 'In which template group this solution belongs to',
      })
      .option('template-version', {
        type: 'string',
        description: 'Version for the template group this will be locked to',
      });
  }
  async handler(_args: Arguments<TemplateInitCommandArgs>) {
    if (existsSync(join(cwd(), CONSTANTS.PROJECT_CONFIG_FILE_NAME))) {
      return _args.logger.error(
        `Config file (${CONSTANTS.PROJECT_CONFIG_FILE_NAME}) already exists in this directory, exiting...`
      );
    }

    const client = getCogniteSDKClient();
    const templates = await client.templates.groups.list();
    const resp = await askUserForInput<TemplateInitCommandArgs>(_args, [
      {
        name: 'template-group-id',
        message: 'Please select template id from this list',
        type: 'autocomplete',
        choices: templates.items.map((t) => t.externalId),
        required: true,
      },
    ]);
    let args = { ..._args, ...resp };

    const versions = (
      await client.templates.group(args['template-group-id']).versions.list()
    ).items.map((v) => v.version);

    if (versions.length > 0) {
      const version = await askUserForInput<TemplateInitCommandArgs>(args, [
        {
          name: 'template-version',
          message: 'Select the version for the template group',
          required: true,
          type: 'autocomplete',
          choices: versions.map((v) => v.toString()),
        },
      ]);

      args = { ...args, ...version };
      if (!versions.includes(parseInt(args['template-version']))) {
        throw new Error(
          `Templates version (${args['template-version']}) not found for template group "${args['template-group-id']}"`
        );
      }
    }

    if (
      args['template-version'] &&
      !versions.includes(parseInt(args['template-version'], 10))
    ) {
      throw new Error(
        `Version ${args['template-version']} does not exist, please make sure you have the right version`
      );
    }

    const { logger } = args;

    try {
      const projectConfig = getProjectConfig();
      if (!projectConfig) {
        return _args.logger.error('Failed to load global config');
      }

      const { cluster, project } = projectConfig;
      const config: ConfigSchema = {
        version: 1,
        name: args['template-group-id'],
        config: {
          cluster,
          project,
          templateId: args['template-group-id'],
          templateVersion: parseInt(args['template-version'] || '0'),
        },
      };
      await writeFile(
        join(cwd(), CONSTANTS.PROJECT_CONFIG_FILE_NAME),
        JSON.stringify(config, undefined, 2)
      );

      logger.success(
        `Solution "${args['template-group-id']}" is successfully initialized!`
      );
    } catch (error) {
      logger.error(`Failed to initialized solution please try again! ${error}`);
    }
  }
}

export default new TemplateInitCommand();
