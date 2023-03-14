import { Arguments } from 'yargs';
import { CLICommand } from '../../../common/cli-command';
import { BaseArgs, CommandArgument, CommandArgumentType } from '../../../types';
import { cwd } from 'process';
import fs from 'fs';
import fsExtra from 'fs-extra';
import path, { join } from 'path';
import { DEBUG as _DEBUG } from '../../../utils/logger';
import { getAuthToken } from '@cognite/platypus-cdf-cli/app/utils/auth';
import { getProjectConfig } from '@cognite/platypus-cdf-cli/app/utils/config';
import { generate } from '@genql/cli';
import typescript from 'rollup-plugin-typescript2';
import { rollup } from 'rollup';
import { getFdmV3MixerApiService } from '../utils';
import { GraphQlUtilsService } from '@platypus/platypus-common-utils';
import { Kind, ObjectTypeDefinitionNode, parse, TypeNode } from 'graphql';
import { DataModelTypeDefsType } from '@platypus/platypus-core';

const DEBUG = _DEBUG.extend('solutions:generate');

export type SolutionsGeneratePythonCommandArgs = BaseArgs & {
  ['external-id']: string;
  ['space']: string;
  ['version']: string;
  ['output-directory']: string;
  ['include-sample']: boolean;
};

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
    name: 'output-directory',
    description: 'The directory for the generated code',
    required: false,
    type: CommandArgumentType.STRING,
    alias: 'output',
    initial: 'generated/',
    example: '--output-directory=generated/',
  },
  {
    name: 'include-sample',
    description: 'Create a sample.ts in /generated',
    required: false,
    type: CommandArgumentType.BOOLEAN,
    alias: 'sample',
    initial: true,
    example: '--include-sample=true',
  },
] as CommandArgument[];

const command = 'generate-js-sdk';
const describe =
  'Create a JavaScript (TypeScript) SDK for interacting with FDM';
class SolutionGenerateJSCommand extends CLICommand {
  async execute(args: Arguments<SolutionsGeneratePythonCommandArgs>) {
    try {
      args.logger.info('Generating...');
      const projectConfig = getProjectConfig();
      const token = await getAuthToken({ ...projectConfig, ...args })();
      const outputDirectory = path.resolve(args['output-directory']);
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      DEBUG('Generating the FDM Query Client in JS/TS...');

      const generatedPath = path.join(__dirname, 'generated');
      await generate({
        endpoint: getFdmV3MixerApiService().getDataModelEndpointUrl(
          args['space'],
          args['external-id'],
          args['version']
        ),
        headers: {
          Authorization: `Bearer ${token}`,
        },
        useGet: true,
        output: generatedPath,
        verbose: args['verbose'],
      });
      await fsExtra.copy(path.resolve(__dirname, './js'), generatedPath);
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
const DM_NAME="${args['external-id']}"
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
      if (args['include-sample']) {
        if (!fs.existsSync(join(cwd(), 'generated'))) {
          fs.mkdirSync(join(cwd(), 'generated'), { recursive: true });
        }
        args.logger.success(
          `Successfully generated "@cognite/fdm-client", feel free to start using FDMQueryClientBuilder (check generated/sample.ts for example!)`
        );
        fs.copyFileSync(
          path.resolve(__dirname, './js/sample.ts'),
          join(cwd(), 'generated/', 'sample.ts')
        );
      }
    } catch (error) {
      DEBUG(`got error: ${JSON.stringify(error)}`);
      args.logger.error(error);
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

  const data = apisResponse.find((el) => el.version === version);
  if (!data) {
    throw new Error('Version does not exist');
  }

  return new GraphQlUtilsService().parseSchema(data.graphQlDml);
};

const getTypeString = (types: DataModelTypeDefsType[]) => {
  const typeItems: string[] = [];
  const directRelations: string[] = [];
  const typeProperties: string[] = [];
  types.forEach((el) => {
    const relationships = el.fields.filter((el) => el.type.custom);
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
      }>${
        // then all direction relationships should be NodeRef
        singleRelationships.length > 0
          ? ` & {${singleRelationships
              .map((el) => `"${el.name}"?: {externalId:string, space?:string}`)
              .join(';\n')} }`
          : ''
      }`
    );
    directRelations.push(
      `${el.name}: ${JSON.stringify(singleRelationships.map((el) => el.name))}`
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
        .map((field) => `${field.name}: "${field.type}"`)
        .join(',\n')}\n}`;
    })
    .join(',\n')}\n};`;
};
