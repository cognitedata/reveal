import {
  DataModelExternalIdValidator,
  DataModelNameValidator,
  DataModelDescriptionValidator,
  SpaceIdValidator,
  DataUtils,
  Validator,
  PlatypusValidationError,
} from '@platypus/platypus-core';
import { Arguments, Argv } from 'yargs';

import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import {
  BaseArgs,
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';

import { getDataModelsHandler } from './utils';

const DEBUG = _DEBUG.extend('data-models:create');

export const commandArgs = [
  {
    name: 'name',
    description: 'The name of the data model',
    prompt: 'Enter the name of the data model',
    isPositional: true,
    type: CommandArgumentType.STRING,
    required: true,
  },
  {
    name: 'external-id',
    description: 'The external id of the data model',
    prompt: 'Enter data model external id',
    type: CommandArgumentType.STRING,
    required: true,
    promptDefaultValue: (commandArgs) => {
      return DataUtils.convertToExternalId(commandArgs['name']);
    },
    example:
      'cdf data-models create "My DM" --external-id="DM1" Create a data model with the name "My DM" and external-id "DM1"',
  },
  {
    name: 'space',
    description: 'Space id of the space the data model should belong to.',
    type: CommandArgumentType.STRING,
    required: true,
    prompt: 'Enter data model space id',
    promptDefaultValue: (commandArgs) => commandArgs['external-id'],
  },
  {
    name: 'description',
    description: 'The description of the data model',
    prompt: 'Enter the description of the data model',
    isPositional: false,
    type: CommandArgumentType.STRING,
    required: false,
  },
] as CommandArgument[];

type DataModelCreateCommandArgs = BaseArgs & {
  name: string;
  'external-id': string;
  space: string;
  descritpion?: string;
};

export class CreateCmd extends CLICommand {
  builder<T>(yargs: Argv<T>): Argv {
    yargs.usage('Creates a new data model to store and retrieve data.');

    return super.builder(yargs);
  }

  async execute(args: Arguments<DataModelCreateCommandArgs>) {
    const validator = new Validator(args);
    validator.addRule('name', new DataModelNameValidator());
    validator.addRule('external-id', new DataModelExternalIdValidator());
    validator.addRule('space', new SpaceIdValidator());
    if (args.descritpion) {
      validator.addRule('description', new DataModelDescriptionValidator());
    }

    const validationResult = validator.validate();
    if (!validationResult.valid) {
      let validationErrors = [];
      for (const field in validationResult.errors) {
        validationErrors.push({ message: validationResult.errors[field] });
      }

      throw new PlatypusValidationError(
        'Could not create data model, one or more of the arguments you passed are invalid.',
        'VALIDATION',
        validationErrors
      );
    }

    const dataModelsHandler = getDataModelsHandler();
    DEBUG('dataModelsHandler initialized');

    const createDataModelArgs = {
      name: args.name,
      space: args?.space || args['external-id'],
      externalId: args['external-id'],
      description: (args['description'] || '') as string,
    };

    const response = await dataModelsHandler.create(createDataModelArgs);

    if (!response.isSuccess) {
      throw response.error;
    }

    DEBUG(
      'Data model was created successfully, %o',
      JSON.stringify(response.getValue(), null, 2)
    );
    Response.success(
      `Data model "${args.name}" has been created successfully.`
    );
  }
}

export default new CreateCmd(
  'create [name]',
  'Create a new data model.',
  commandArgs
);
