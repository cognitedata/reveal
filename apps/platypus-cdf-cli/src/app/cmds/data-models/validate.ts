import { readFileSync } from 'fs';

import {
  FlexibleDataModelingClient,
  mixerApiBuiltInTypes,
} from '@platypus/platypus-core';
import { Arguments, Argv } from 'yargs';

import { CLICommand } from '../../common/cli-command';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../types';
import Response, { DEBUG as _DEBUG } from '../../utils/logger';

import { getFlexibleDataModelingClient } from './utils';

const DEBUG = _DEBUG.extend('data-models:validate');

export const commandArgs = [
  {
    name: 'file',
    description: 'The file containing the new GraphQL definition',
    prompt: 'Enter the path to the file containing your GraphQL definition',
    type: CommandArgumentType.STRING,
    required: true,
    example: `cdf data-models validate --file="./dm.gql"
       Validate data model specified in "dm.gql"`,
  },
] as CommandArgument[];

type DataModelValidateCommandArgs = BaseArgs & {
  file: string;
};

export class ValidateCmd extends CLICommand {
  private fdmClient: FlexibleDataModelingClient;

  builder<T>(yargs: Argv<T>): Argv {
    yargs.usage(`
      Validates a data model GraphQL definition. 

      Check out the full documentation here: https://docs.cognite.com/cli
    `);

    return super.builder(yargs);
  }

  async execute(args: Arguments<DataModelValidateCommandArgs>) {
    this.fdmClient = getFlexibleDataModelingClient();

    DEBUG('dataModelVersionsHandler initialized');

    let graphqlSchema;
    try {
      graphqlSchema = await this.readGraphqlSchemaFile(args.file);
    } catch (e) {
      Response.error(`Unable to read specified GraphQL file: ${args.file}`);
      return;
    }

    const errors = this.fdmClient.validateGraphql(
      graphqlSchema,
      mixerApiBuiltInTypes
    );

    if (errors.length) {
      Response.error(`GraphQL file contains errors: ${errors}`);
    }

    Response.success(`GraphQL file is valid.`);
  }

  private async readGraphqlSchemaFile(path: string) {
    DEBUG('Reading graphql file ' + path);
    const schema = readFileSync(path, {
      encoding: 'utf-8',
    }).toString();
    DEBUG('Schema contents %o', schema);

    return schema;
  }
}

export default new ValidateCmd(
  'validate',
  'Validates a data model with a new GraphQL definition.',
  commandArgs
);
