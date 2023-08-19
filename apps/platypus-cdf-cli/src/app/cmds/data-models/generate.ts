import fs from 'fs';
import path, { join } from 'path';

import { generate } from '@genql/cli';
import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import {
  DataModelTypeDefsType,
  mixerApiBuiltInTypes,
} from '@platypus/platypus-core';
import fsExtra from 'fs-extra';
import { buildClientSchema, getIntrospectionQuery, printSchema } from 'graphql';
import { rollup } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { Arguments } from 'yargs';

import {
  CONSTANTS,
  SupportedGraphQLGeneratorPlugins,
} from '@cognite/platypus-cdf-cli/app/constants';
import { getAuthToken } from '@cognite/platypus-cdf-cli/app/utils/auth';
import { getProjectConfig } from '@cognite/platypus-cdf-cli/app/utils/config';

import { CLICommand } from '../../common/cli-command';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../types';
import { DEBUG as _DEBUG } from '../../utils/logger';

import { getFdmV3MixerApiService } from './utils';

const DEBUG = _DEBUG.extend('data-models:generate');

export type SolutionsGeneratePythonCommandArgs = BaseArgs & {
  ['external-id']: string;
  ['space']: string;
  ['version']: string;
  ['output-directory']: string;
  ['plugins']: string[];
  ['skip-sample']: boolean;
};

const commandArgs = [
  {
    name: 'external-id',
    description: 'The external ID of the data model.',
    prompt: 'Enter data model external ID',
    type: CommandArgumentType.STRING,
    required: true,
  },
  {
    name: 'space',
    description:
      'Space ID of the space the data model should belong to. Defaults to same as external-id.',
    type: CommandArgumentType.STRING,
    required: true,
    prompt: 'Enter data model space ID',
    promptDefaultValue: (commandArgs) => commandArgs['external-id'],
  },
  {
    name: 'version',
    description: 'Data model version.',
    type: CommandArgumentType.STRING,
    prompt: 'Enter data model version',
    required: true,
  },
  {
    name: 'plugins',
    description:
      'What to generate, we currently support :\n- "js-sdk" - Create a JavaScript (TypeScript) SDK from a data model to query and populate data, with code completion, type checks, and more.',
    prompt: `Select the plugin to generate the types (use <space> to select):`,
    type: CommandArgumentType.MULTI_SELECT,
    options: {
      choices: SupportedGraphQLGeneratorPlugins,
    },
    initial: SupportedGraphQLGeneratorPlugins,
    required: true,
    example: `cdf data-models generate
      --external-id=moviedm
      --version=1
      ${SupportedGraphQLGeneratorPlugins.map((el) => `--plugins=${el}`).join(
        ','
      )}`,
  },
  {
    name: 'output-directory',
    description: 'The directory for the generated code.',
    required: false,
    type: CommandArgumentType.STRING,
    alias: 'output',
    initial: 'dm-client/',
    example: '--output-directory=dm-client/',
  },
  {
    name: 'skip-sample',
    description: 'Create a sample.ts in the output directory.',
    required: false,
    type: CommandArgumentType.BOOLEAN,
    alias: 'sample',
    initial: false,
    example: '--skip-sample=false',
  },
] as CommandArgument[];

const command = 'generate';
const describe =
  'Generate client for querying and modifying data in the data model.';
class SolutionGenerateJSCommand extends CLICommand {
  async execute(args: Arguments<SolutionsGeneratePythonCommandArgs>) {
    try {
      if (
        !args['plugins'] ||
        !args['plugins'].includes(CONSTANTS.GRAPHQL_CODEGEN_PLUGINS_NAME.JS_SDK)
      ) {
        args.logger.info('No valid plugin selected. Nothing is generated.');
        return;
      }
      args.logger.info('Generating...');
      const projectConfig = getProjectConfig();
      const token = await getAuthToken({ ...projectConfig, ...args })();
      const outputDirectory = path.resolve(args['output-directory']);
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      DEBUG('Generating the FDM Query Client in JS/TS...');

      const generatedPath = path.join(__dirname, 'generated');

      // get client schemagetFdmV3MixerApiService().getDataModelEndpointUrl(

      DEBUG('Fetching Introspection...');
      const result = await getFdmV3MixerApiService().runQuery({
        space: args['space'],
        dataModelId: args['external-id'],
        schemaVersion: args['version'],
        graphQlParams: {
          query: getIntrospectionQuery(),
        },
      });
      DEBUG('Fetching Client from GenQL...');
      await generate({
        // yuck, but this is the most consistent way to pass in a schema string to the library
        // cant use the endpoint field, because the library uses fetch, which does not do gzip decompression
        // and there is no way to customize it https://github.com/node-fetch/node-fetch/issues/93
        schema: printSchema(buildClientSchema(result.data)),
        output: generatedPath,
        verbose: args['verbose'],
        scalarTypes: mixerApiBuiltInTypes
          .filter((el) => el.tsType && el.type === 'SCALAR')
          .reduce((prev, curr) => {
            return {
              ...prev,
              [curr.name]: curr.tsType,
            };
          }, {} as { [key in string]: string }),
      });
      await fs.copyFileSync(
        path.resolve(__dirname, './js/FDMQueryClient.ts'),
        path.resolve(generatedPath, './FDMQueryClient.ts')
      );
      fs.appendFileSync(
        path.resolve(generatedPath, './FDMQueryClient.ts'),
        `
const BEARER_TOKEN="${token}"
const CLUSTER="${projectConfig.cluster}"
const PROJECT="${projectConfig.project}"
const TENANT="${projectConfig.tenant}"
const ENDPOINT="${getFdmV3MixerApiService().getDataModelEndpointUrl(
          args['space'],
          args['external-id'],
          args['version']
        )}"
const DM_VERSION="${args['version']}"
const SPACE="${args['space']}"`
      );

      // Upsert stuff
      const { types } = await getModelTypes(
        args['space'],
        args['external-id'],
        args['version']
      );
      const typesString = getTypeString(types);
      fs.appendFileSync(
        path.resolve(generatedPath, './schema.ts'),
        typesString
      );
      const typesVersionString = getTypeVersionString(types);
      fs.appendFileSync(
        path.resolve(generatedPath, './schema.ts'),
        typesVersionString
      );

      const relationshipsString = getRelationshipString(types);
      fs.appendFileSync(
        path.resolve(generatedPath, './schema.ts'),
        relationshipsString
      );
      fs.appendFileSync(
        path.resolve(generatedPath, './index.ts'),
        `export * from './FDMQueryClient';`
      );

      // perform rollup
      const bundle = await rollup({
        input: path.resolve(generatedPath, 'index.ts'),
        plugins: [
          typescript({
            tsconfig: undefined,
            tsconfigOverride: {
              compilerOptions: {
                declaration: true,
                module: 'ES2015',
              },
              include: [path.resolve(generatedPath)],
              exclude: ['node_modules'],
            },
          }),
        ],
        external: ['graphql', '@genql/runtime', '@cognite/sdk'],
      });

      await bundle.write({
        file: path.resolve(generatedPath, 'index.js'),
        format: 'cjs',
      });
      await fsExtra.copy(generatedPath, outputDirectory, {
        recursive: true,
        overwrite: true,
      });

      if (!args['skip-sample']) {
        if (!fs.existsSync(outputDirectory)) {
          fs.mkdirSync(outputDirectory, { recursive: true });
        }
        fs.copyFileSync(
          path.resolve(__dirname, './js/sample.ts'),
          join(outputDirectory, 'sample.ts')
        );
      }
      args.logger.success(
        `Successfully generated in "${
          args['output-directory']
        }", feel free to start using FDMQueryClientBuilder${
          args['skip-sample']
            ? ''
            : ` (check ${args['output-directory']}sample.ts for example!)`
        }`
      );
    } catch (error) {
      DEBUG(`got error: ${JSON.stringify(error)}`);
      args.logger.error(
        'message' in error ? error.message : JSON.stringify(error)
      );
    }
  }
}

export default new SolutionGenerateJSCommand(command, describe, commandArgs);

export const getModelTypes = async (
  space: string,
  externalId: string,
  version: string
) => {
  const mixerApiService = getFdmV3MixerApiService();
  DEBUG('mixerApiService initialized');

  const apisResponse = await mixerApiService.getDataModelVersionsById(
    space,
    externalId
  );
  if (!apisResponse) {
    throw new Error('Data model does not exist');
  }

  DEBUG(apisResponse);

  const data = apisResponse.find((el) => el.version === version);
  if (!data) {
    throw new Error('Version does not exist');
  }

  return new GraphQlUtilsService().parseSchema(data.graphQlDml, data.views);
};

const getTypeString = (types: DataModelTypeDefsType[]) => {
  const typeItems: string[] = [];
  const directRelations: string[] = [];
  const typeProperties: string[] = [];
  const dateProperties: string[] = [];
  types.forEach((el) => {
    const relationships = el.fields.filter((el) => el.type.custom);
    const customFields = el.fields.filter((el) =>
      ['TimeSeries', 'File', 'Sequence'].includes(el.type.name)
    );
    const dates = el.fields.filter((el) => el.type.name === 'Date');
    const singleRelationships = relationships.filter((el) => !el.type.list);
    typeItems.push(
      `${el.name}: Omit<${
        el.name
        // first omit the __typename, space,
      }, "__typename"|"space"|"createdTime"|"lastUpdatedTime"${
        // then omit all the relationships
        relationships.length > 0
          ? `|"${relationships.map((field) => `${field.name}`).join('"|"')}"`
          : ''
      }${
        // then omit all the relationships
        customFields.length > 0
          ? `|"${customFields.map((field) => `${field.name}`).join('"|"')}"`
          : ''
      }>${
        // then all direction relationships should be NodeRef
        singleRelationships.length > 0
          ? ` & {${singleRelationships
              .map((el) => `"${el.name}"?: {externalId:string, space?:string}`)
              .join(';\n')} }`
          : ''
      }${
        // then all direction relationships should be NodeRef
        customFields.length > 0
          ? ` & {${customFields
              .map(
                (el) => `"${el.name}"?: ${el.type.list ? 'string[]' : 'string'}`
              )
              .join(';\n')} }`
          : ''
      }`
    );
    directRelations.push(
      `${el.name}: ${JSON.stringify(singleRelationships.map((el) => el.name))}`
    );
    dateProperties.push(
      `${el.name}: ${JSON.stringify(dates.map((el) => el.name))}`
    );
    typeProperties.push(
      `${el.name}: ${JSON.stringify(
        el.fields.filter((el) => !el.type.custom).map((el) => el.name)
      )}`
    );
  });
  return `
  export type ModelNodeMap = {
    ${typeItems.join('\n')}
  };
  export const TypeProperties: { [key in string]: string[] } = {
    ${typeProperties.join(',\n')}
  };
  export const DirectProperties: { [key in string]: string[] } = {
    ${directRelations.join(',\n')}
  };
  export const DateProperties: { [key in string]: string[] } = {
    ${dateProperties.join(',\n')}
  };`;
};
const getTypeVersionString = (types: DataModelTypeDefsType[]) => {
  return `
  export const TypeVersions: { [key in string]: string } = {
    ${types.map((el) => `"${el.name}": "${el.version}"`).join(',\n')}
  };`;
};

const getRelationshipString = (types: DataModelTypeDefsType[]) => {
  return `export const RelationshipMap = {\n ${types
    .map((el) => {
      const multiRelationships = el.fields.filter(
        (el) => el.type.custom && el.type.list
      );
      return { name: el.name, relationships: multiRelationships };
    })
    .filter(({ relationships }) => relationships.length !== 0)
    .map(({ name, relationships }) => {
      return `${name}: {\n${relationships
        .map((field) => `${field.name}: "${field.type.name}"`)
        .join(',\n')}\n}`;
    })
    .join(',\n')}\n};`;
};
