import { Arguments } from 'yargs';
import { generate } from '@graphql-codegen/cli';
import { CLICommand } from '../../common/cli-command';
import { injectRCFile } from '../../common/config';
// dont remove these unused imports as this are bundled by the webpack and used by the cli (standalone)
import '@graphql-codegen/typescript';
import '@graphql-codegen/typescript-operations';
import '@graphql-codegen/typescript-resolvers';
import '@graphql-codegen/typescript-react-apollo';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../types';
import { cwd } from 'process';
import { SupportedGraphQLGeneratorPlugins } from '../../constants';
import { TemplatesApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';

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
      const { plugins } = args;
      const client = getCogniteSDKClient();
      const templates = new TemplatesApiService(client);
      const response = await templates.runQuery({
        solutionId: args.solutionConfig.config.templateId,
        schemaVersion: args.solutionConfig.config.templateVersion.toString(),
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
      await generate({
        schema: printSchema(buildClientSchema(response.data)),
        documents: args['operations-file'],
        generates: {
          [(cwd(), args['output-file'])]: { plugins },
        },
      });
      args.logger.info('Types generated successfully');
    } catch (error) {
      args.logger.error(error);
    }
  }
}

export default new TemplateGenerateCommand(command, describe, commandArgs);
