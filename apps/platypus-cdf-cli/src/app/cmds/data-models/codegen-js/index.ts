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
import { getMixerApiService } from '../utils';
import { Kind, ObjectTypeDefinitionNode, parse, TypeNode } from 'graphql';

const DEBUG = _DEBUG.extend('solutions:generate');

export type SolutionsGeneratePythonCommandArgs = BaseArgs & {
  ['data-model']: string;
  ['data-model-version']: string;
  ['output-directory']: string;
  ['include-sample']: boolean;
};

const commandArgs = [
  {
    name: 'data-model',
    description: 'The externalId of the data model',
    required: true,
    type: CommandArgumentType.STRING,
    alias: 'dm',
    prompt: 'What is the externalId of the data model?',
    help: 'The externalId of the data model',
    example: '--data-model=schema-test',
  },
  {
    name: 'data-model-version',
    description: 'The version of the data model',
    required: true,
    type: CommandArgumentType.STRING,
    alias: 'dm-version',
    prompt: 'What is the version of the data model?',
    help: 'The name of the data model',
    example: '--data-model-version=1',
  },
  {
    name: 'output-directory',
    description: 'The directory for the generated code',
    required: false,
    type: CommandArgumentType.STRING,
    alias: 'output',
    initial: 'node_modules/.cognite/fdm-client',
    example: '--output-directory=node_modules/.cognite/fdm-client',
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
      args.logger.info(
        "Don't forget to install @cognite/fdm-client in your solution!"
      );
      args.logger.info(
        '"yarn add @cognite/fdm-client" or "npm i @cognite/fdm-client"'
      );
      const projectConfig = getProjectConfig();
      const token = await getAuthToken({ ...projectConfig, ...args })();
      const outputDirectory = path.resolve(args['output-directory']);
      if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }

      DEBUG('Generating the FDM Query Client in JS/TS...');

      const generatedPath = path.join(__dirname, 'generated');
      await generate({
        endpoint: `https://${projectConfig.cluster}.cognitedata.com/api/v1/projects/${projectConfig.project}/schema/api/${args['data-model']}/${args['data-model-version']}/graphql`,
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
const DM_NAME="${args['data-model']}"
const DM_VERSION="${args['data-model-version']}"`
      );

      // Upsert stuff
      const types = await getModelTypes(
        args['data-model'],
        Number(args['data-model-version'])
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

      fs.renameSync(
        path.resolve(generatedPath, 'index.d.ts'),
        path.resolve(generatedPath, 'codegen.d.ts')
      );
      fs.copyFileSync(
        path.resolve(generatedPath, 'codegen.d.ts'),
        path.resolve(generatedPath, 'codegen.esm.d.ts')
      );
      fs.renameSync(
        path.resolve(generatedPath, 'index.esm.js'),
        path.resolve(generatedPath, 'codegen.esm.js')
      );
      fs.renameSync(
        path.resolve(generatedPath, 'index.js'),
        path.resolve(generatedPath, 'codegen.js')
      );

      //perform rollup
      const bundle = await rollup({
        input: path.resolve(generatedPath, 'FDMQueryClient.ts'),
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
        file: path.resolve(generatedPath, 'FDMQueryClient.js'),
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

export const getModelTypes = async (dm: string, version: number) => {
  const mixerApiService = getMixerApiService();
  DEBUG('mixerApiService initialized');

  const [apisResponse] = await mixerApiService.getApisByIds(dm, true);
  if (!apisResponse) {
    throw new Error('Data model does not exist');
  }

  const data = apisResponse.versions.find((el) => el.version === version);
  if (!data) {
    throw new Error('Version does not exist');
  }

  return parse(data.dataModel.graphqlRepresentation).definitions.filter(
    (el) => el.kind === Kind.OBJECT_TYPE_DEFINITION
  ) as ObjectTypeDefinitionNode[];
};

const getTypeString = (types: ObjectTypeDefinitionNode[]) => {
  const typeNames = types.map((el) => el.name.value);

  return `import { NodeRef } from './FDMQueryClient';\nexport type ModelNodeMap = {\n ${types
    .map((el) => {
      const relationships = el.fields
        .map((el) => ({
          name: el.name.value,
          ...getFieldType(el.type, typeNames),
        }))
        .filter((el) => el.relationship);
      const singleRelationships = relationships.filter((el) => !el.list);
      return `${el.name.value}: Omit<${
        el.name.value
        // first omit the __typename and spaceExternalId
      }, "__typename"|"spaceExternalId"${
        // then omit all the relationships
        relationships.length > 0
          ? `|"${relationships.map((field) => `${field.name}`).join('"|"')}"`
          : ''
      }>${
        // then all direction relationships should be NodeRef
        singleRelationships.length > 0
          ? ` & {${singleRelationships
              .map((el) => `"${el.name}"?: NodeRef`)
              .join(';\n')} }`
          : ''
      }`;
    })
    .join('\n')}\n};`;
};

const getRelationshipString = (types: ObjectTypeDefinitionNode[]) => {
  const typeNames = types.map((el) => el.name.value);

  return `export const RelationshipMap = {\n ${types
    .map((el) => {
      const multiRelationships = el.fields
        .map((el) => ({
          name: el.name.value,
          ...getFieldType(el.type, typeNames),
        }))
        .filter((el) => el.list && el.relationship);
      return { name: el.name.value, relationships: multiRelationships };
    })
    .filter(({ relationships }) => relationships.length !== 0)
    .map(({ name, relationships }) => {
      return `${name}: {\n${relationships
        .map((field) => `${field.name}: "${field.type}"`)
        .join(',\n')}\n}`;
    })
    .join(',\n')}\n};`;
};

export const getFieldType = (
  type: TypeNode,
  types: string[]
): {
  type: string;
  relationship?: boolean;
  list?: boolean;
  required?: boolean;
} => {
  switch (type.kind) {
    case Kind.NAMED_TYPE: {
      if (types.includes(type.name.value)) {
        return { type: type.name.value, relationship: true };
      }
      return { type: type.name.value };
    }
    case Kind.LIST_TYPE:
      return { ...getFieldType(type.type, types), list: true };
    case Kind.NON_NULL_TYPE:
      return { ...getFieldType(type.type, types), required: true };
  }
};
