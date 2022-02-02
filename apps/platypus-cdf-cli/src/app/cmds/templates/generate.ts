import { Arguments } from 'yargs';
import { codegen } from '@graphql-codegen/core';
import { CLICommand } from '../../common/cli-command';
import { injectRCFile } from '../../common/config';
// dont remove these unused imports as this are bundled by the webpack and used by the cli (standalone)
import * as typescriptPlugin from '@graphql-codegen/typescript';
import * as typescriptOperationsPlugin from '@graphql-codegen/typescript-operations';
import * as typescriptResolversPlugin from '@graphql-codegen/typescript-resolvers';
import * as typescriptReactApolloPlugin from '@graphql-codegen/typescript-react-apollo';
import * as typescriptApolloAngularPlugin from '@graphql-codegen/typescript-apollo-angular';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../types';
import { cwd } from 'process';
import { SupportedGraphQLGeneratorPlugins } from '../../constants';
import { TemplatesApiService } from '@platypus/platypus-core';
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

export type TemplateGenerateCommandArgs = BaseArgs & {
  ['plugins']?: string[];
  ['output-file']?: string;
  ['operations-file']?: string;
};

const commandArgs = [
  {
    name: 'plugins',
    description: 'Plugin which will be use for code generation',
    required: true,
    type: CommandArgumentType.MULTI_SELECT,
    prompt:
      'Select the plugin to generate the types, we currently support few of the @graphql-codegen plugins only',
    options: {
      choices: SupportedGraphQLGeneratorPlugins,
    },
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

const command = 'generate';
const describe =
  'Generate will help to generate a graphql client code for the schema of the current template';
class TemplateGenerateCommand extends CLICommand {
  @injectRCFile()
  async execute(args: Arguments<TemplateGenerateCommandArgs>) {
    try {
      const client = getCogniteSDKClient();
      const templates = new TemplatesApiService(client);
      const response = await templates.runQuery({
        solutionId: args.solutionConfig.all.config.templateId,
        schemaVersion:
          args.solutionConfig.all.config.templateVersion.toString(),
        graphQlParams: {
          query: getIntrospectionQuery(),
          operationName: 'IntrospectionQuery',
        },
      });
      if (response.errors) {
        return args.logger.error(
          'Failed to obtain results from introspection query'
        );
      }
      let documents = [];
      if (
        args['operations-file'] &&
        (await stat(resolve(args['operations-file']))).isFile()
      ) {
        const file = resolve(args['operations-file']);
        const fileContent = await readFile(file, 'utf8');
        documents = [{ document: parse(fileContent) }];
      } else {
        args.logger.warn(
          'No operations file provided, skipping operation generations'
        );
      }

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
      await writeFile(join(cwd(), args['output-file']), generatedCode);
      args.logger.success('Types generated successfully');
    } catch (error) {
      args.logger.error(error);
    }
  }
}

export default new TemplateGenerateCommand(command, describe, commandArgs);
