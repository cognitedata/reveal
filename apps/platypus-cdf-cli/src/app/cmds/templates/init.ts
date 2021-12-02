import { existsSync, lstatSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import { Arguments, Argv, CommandModule } from 'yargs';
import { makeFolderAndCreateConfig } from '../../common/config';
import { askUserForInput } from '../../common/prompt';
import { BaseArgs } from '../../types';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { getProjectConfig } from '../../utils/config';

export type TemplateInitCommandArgs = BaseArgs & {
  ['name']?: string;
  ['template-group-id']?: string;
  ['template-version']?: string;
  ['schema-file']?: string;
};

export class TemplateInitCommand implements CommandModule {
  public readonly command = 'init [name]';
  public readonly describe = 'Init a PLatypus Solution';
  builder(argv: Argv<TemplateInitCommandArgs>) {
    return argv
      .positional('name', {
        description: 'Name of the solution',
        type: 'string',
      })
      .check(({ name }) => (name ? isValidSolutionName(name) : true))
      .option('template-group-id', {
        type: 'string',
        description: 'In which template group this solution belongs to',
      })
      .option('template-version', {
        type: 'string',
        description: 'Version for the template group this will be locked to',
      })
      .option('schema-file', {
        type: 'string',
        description: 'Schema file location',
      })
      .check(({ 'schema-file': file }) =>
        file ? checkIfFileExists(file) : true
      );
  }
  async handler(_args: Arguments<TemplateInitCommandArgs>) {
    const client = getCogniteSDKClient();
    const templates = await client.templates.groups.list();
    const resp = await askUserForInput<TemplateInitCommandArgs>(_args, [
      {
        name: 'name',
        message: 'Enter the name for the solution',
        type: 'input',
        required: true,
        validate: isValidSolutionName,
      },
      {
        name: 'schema-file',
        message: 'Enter the file path for the schema file',
        type: 'input',
        required: true,
        validate: checkIfFileExists,
      },
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
          choices: versions,
        },
      ]);

      args = { ...args, ...version };
    }

    const { name, logger } = args;

    try {
      const projectConfig = getProjectConfig();
      if (!projectConfig) {
        return _args.logger.error('Failed to load global config');
      }
      const { cluster, project } = projectConfig;
      await makeFolderAndCreateConfig(join(cwd(), name), {
        version: 1,
        name,
        config: {
          cluster,
          project,
          templateId: args['template-group-id'],
          templateVersion: args['template-version'] || '1',
          schemaFile: args['schema-file'],
        },
      });
      logger.info(`Solution "${name}" is successfully initialized!`);
    } catch (error) {
      logger.error(`Failed to initialized solution please try again! ${error}`);
    }
  }
}

const isValidSolutionName = (name: string) => {
  if (existsSync(join(cwd(), name))) {
    return `There already exist a file/folder with name "${name}", make sure you are using a unique name`;
  }
  return true;
};

const checkIfFileExists = (path: string) => {
  if (existsSync(path) && lstatSync(path).isFile()) {
    return true;
  }
  return `File path "${path}" provided doesn't exists or can't be accessed, make sure if the file exists and proper permission provided to it`;
};
