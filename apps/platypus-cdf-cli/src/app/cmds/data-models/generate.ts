import { Arguments } from 'yargs';
import { codegen } from '@graphql-codegen/core';
import { CLICommand } from '../../common/cli-command';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import * as typescriptOperationsPlugin from '@graphql-codegen/typescript-operations';
import * as typescriptResolversPlugin from '@graphql-codegen/typescript-resolvers';
import * as typescriptReactApolloPlugin from '@graphql-codegen/typescript-react-apollo';
import * as typescriptApolloAngularPlugin from '@graphql-codegen/typescript-apollo-angular';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../types';
import { cwd } from 'process';
import { SupportedGraphQLGeneratorPlugins } from '../../constants';
import { FdmMixerApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { CONSTANTS } from '../../constants';
import {
  buildClientSchema,
  getIntrospectionQuery,
  printSchema,
  parse,
} from 'graphql';
import { promises } from 'fs';
const { readFile, stat, writeFile } = promises;
import { join, resolve } from 'path';
import { DEBUG as _DEBUG } from '../../utils/logger';

const DEBUG = _DEBUG.extend('data-models:generate');

const commandArgs = [
  {
    name: 'external-id',
    description: 'The external id of the data model',
    prompt: 'Enter data model external ID',
    type: CommandArgumentType.STRING,
    required: true,
  },
  {
    name: 'space',
    description:
      'Space id of the space the data model should belong to. Defaults to same as external-id.',
    type: CommandArgumentType.STRING,
    required: true,
    prompt: 'Enter data model space ID',
    promptDefaultValue: (commandArgs) => commandArgs['external-id'],
  },
  {
    name: 'version',
    description: 'Data model version',
    type: CommandArgumentType.STRING,
    prompt: 'Enter data model version',
    required: true,
  },
  {
    name: 'plugins',
    description:
      'Plugin which will be use for code generation (each plugin-name separated by ",")',
    prompt: `Select the plugin to generate the types, we currently support ${SupportedGraphQLGeneratorPlugins.join(
      ','
    )}`,
    type: CommandArgumentType.MULTI_SELECT,
    options: {
      choices: SupportedGraphQLGeneratorPlugins,
    },
    required: true,
    example: `cdf data-models generate
      --external-id=schema-test
      --plugins=${SupportedGraphQLGeneratorPlugins.join(',')}`,
  },
  {
    name: 'operations-file',
    description: 'Path to the operations.graphql file',
    required: false,
    type: CommandArgumentType.STRING,
    prompt: 'Enter the path to the operations.graphql file',
  },
  {
    name: 'output-file',
    description: 'The file name of the generated code',
    required: false,
    type: CommandArgumentType.STRING,
    alias: 'f',
    initial: 'generated-types.ts',
  },
] as CommandArgument[];

type DataModelGenerateCommandArgs = BaseArgs & {
  'external-id': string;
  plugins?: string[];
  space: string;
  version: string;
  'output-file'?: string;
  'operations-file'?: string;
};

class GenerateCmd extends CLICommand {
  async execute(args: Arguments<DataModelGenerateCommandArgs>) {
    try {
      const client = getCogniteSDKClient();
      DEBUG('Initialize the Cognite SDK client');
      const mixerApi = new FdmMixerApiService(client);
      DEBUG('Fetching the introspection query from the server');
      const response = await mixerApi.runQuery({
        dataModelId: args['external-id'],
        space: args['space'],
        schemaVersion: args['version'],
        graphQlParams: {
          query: getIntrospectionQuery(),
          operationName: 'IntrospectionQuery',
        },
      });
      DEBUG(`got introspection query response: ${JSON.stringify(response)}`);
      if (response.errors) {
        DEBUG(`got errors: ${JSON.stringify(response.errors)}`);
        if (response.errors.length > 0) {
          return args.logger.error(
            response.errors.map((error) => error.message).join('\n')
          );
        }
        return args.logger.error(
          'Failed to obtain results from introspection query'
        );
      }
      let documents = [];
      if (
        args['operations-file'] &&
        (await stat(resolve(args['operations-file']))).isFile()
      ) {
        DEBUG(`got operations file: ${args['operations-file']}`);
        const file = resolve(args['operations-file']);
        const fileContent = await readFile(file, 'utf8');
        documents = [{ document: parse(fileContent) }];
      } else {
        args.logger.warn(
          'No operations file provided, skipping operation generations'
        );
      }
      DEBUG('Generating the code, this may take a while');
      const generatedCode = await codegen({
        filename: args['output-file'],
        config: {},
        documents,
        schema: parse(printSchema(buildClientSchema(response.data))),
        plugins: args.plugins.map((name) => ({ [name]: {} })),
        pluginMap: {
          [CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.TYPESCRIPT]: typescriptPlugin,
          [CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.TYPESCRIPT_OPERATIONS]:
            typescriptOperationsPlugin,
          [CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.TYPESCRIPT_RESOLVERS]:
            typescriptResolversPlugin,
          [CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.TYPESCRIPT_REACT_APOLLO]:
            typescriptReactApolloPlugin,
          [CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.TYPESCRIPT_APOLLO_ANGULAR]:
            typescriptApolloAngularPlugin,
        },
      });
      DEBUG(`generated code: ${generatedCode}`);
      await writeFile(join(cwd(), args['output-file']), generatedCode);
      DEBUG('Done');
      args.logger.success(
        `Successfully generated types in ${args['output-file']}.`
      );
    } catch (error) {
      DEBUG(`got error: ${JSON.stringify(error)}`);
      args.logger.error(error);
    }
  }
}

export default new GenerateCmd(
  'generate',
  'Generate a JavaScript GraphQL client for the data model. Powered by https://the-guild.dev/graphql/codegen.',
  commandArgs
);
