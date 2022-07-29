import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import {
  BaseArgs,
  CommandArgument,
  CommandArgumentType,
} from '@cognite/platypus-cdf-cli/app/types';
import Response, {
  DEBUG as _DEBUG,
} from '@cognite/platypus-cdf-cli/app/utils/logger';
import {
  DataModelExternalIdValidator,
  Validator,
} from '@platypus/platypus-core';
import { Arguments, Argv } from 'yargs';

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
    example:
      'cdf data-models create "Testing DM"   Create a data model with the name (and external-id) "Testing DM"',
  },
  {
    name: 'external-id',
    description:
      'The external id of the data model (Default value is name if not specified)',
    prompt: 'Enter data model external id',
    type: CommandArgumentType.STRING,
    required: false,
    example:
      'cdf data-models create "My DM" --external-id="DM1" --data-set-id="ds-1"   Create a data model with the name "My DM" and external-id "DM1" managed by Data Set "ds-1"',
  },
  {
    name: 'data-set-id',
    description: 'Determine the users who can modify the data model',
    prompt: 'Enter data set ID',
    type: CommandArgumentType.STRING,
    required: false,
  },
] as CommandArgument[];

type DataModelCreateCommandArgs = BaseArgs & {
  name: string;
  'external-id': string;
  'data-set-id': string;
};

export class CreateCmd extends CLICommand {
  builder<T>(yargs: Argv<T>): Argv {
    yargs.usage(
      'Creates a new data model in CDF that allows you to store and retrieve data to your needs.'
    );

    return super.builder(yargs);
  }

  async execute(args: Arguments<DataModelCreateCommandArgs>) {
    const validator = new Validator(args);
    if (args['external-id'] !== undefined) {
      validator.addRule('external-id', new DataModelExternalIdValidator());
    }
    const validationResult = validator.validate();

    if (!validationResult.valid) {
      throw validationResult.errors;
    }

    const dataModelsHandler = getDataModelsHandler();
    DEBUG('dataModelsHandler initialized');

    const response = await dataModelsHandler.create({
      name: args.name,
      externalId: args['external-id'],
    });

    if (!response.isSuccess) {
      throw response.error;
    }

    DEBUG(
      'Data model was created successfully, %o',
      JSON.stringify(response.getValue(), null, 2)
    );
    Response.success(`Data model "${args.name}" has been created successfully`);
  }
}

export default new CreateCmd(
  'create [name]',
  'Create a new data model',
  commandArgs
);
