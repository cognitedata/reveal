import { SolutionsApiService } from '@platypus/platypus-core';
import { getCogniteSDKClient } from '../../utils/cogniteSdk';
import { CommandArgument, CommandArgumentType } from '../../types';
import { CLICommand } from '@cognite/platypus-cdf-cli/app/common/cli-command';
import Response from '@cognite/platypus-cdf-cli/app/utils/logger';
import { DEBUG as _DEBUG } from '../../utils/logger';
import { readFileSync, existsSync } from 'fs';

export const commandArgs = [
  {
    name: 'project-name',
    description: 'The name of the project',
    required: true,
    type: CommandArgumentType.STRING,
    prompt: 'What is the name of the project?',
    help: 'The name of the project',
    example:
      '$0 solutions deplot --project-name=schema-test --file=./maniest.json',
  },
  {
    name: 'file',
    description:
      'The manifest.json that contains the config for schema, tables, bindings',
    prompt:
      'Please specify the the path to the `manifest.json` config file that you want to deploy',
    type: CommandArgumentType.STRING,
    required: true,
  },
] as CommandArgument[];

const DEBUG = _DEBUG.extend('platypus-cdf-cli:solutions:deploy');
export class DeployCommand extends CLICommand {
  async execute(args) {
    const client = getCogniteSDKClient();
    DEBUG('CDF Clint initialized');

    const solutionSchemaApi = new SolutionsApiService(client);
    DEBUG('SolutionsApiService initialized');

    let manifestConfig;
    try {
      manifestConfig = readFile(args.file, 'Manifest');
      manifestConfig = JSON.parse(manifestConfig);
    } catch (ex) {
      DEBUG(JSON.stringify(ex, null, 2));
      Response.error(args.sverbose ? JSON.stringify(ex, null, 2) : ex.message);
      throw ex;
    }

    if (!manifestConfig.apiSpec || !manifestConfig.apiSpec.source) {
      DEBUG(JSON.stringify(manifestConfig, null, 2));
      Response.error(`Invalid apiSpec was provided. Example:
      {
        "apiSpec": {
          "externalId": "schema-demo",
          "source": "apiSpec.graphql"
        }
      }
      `);
      return;
    }

    if (!existsSync(manifestConfig.apiSpec.source)) {
      Response.error(`Provided graphql file does not exist.
      `);
      return;
    }

    let graphQlSchema;
    try {
      graphQlSchema = readFile(manifestConfig.apiSpec.source, 'GraphQL');
    } catch (ex) {
      DEBUG(JSON.stringify(ex, null, 2));
      Response.error(args.sverbose ? JSON.stringify(ex, null, 2) : ex.message);
      return;
    }

    DEBUG(`Creating/Updaing ApiSpec`);
    const apiSpec = await solutionSchemaApi.updateApiSpec(
      manifestConfig.apiSpec
    );

    let latestApiSpecVersion =
      apiSpec.versions.length > 0
        ? apiSpec.versions[apiSpec.versions.length - 1]
        : null;

    DEBUG('ApiSpec was saved, %o', JSON.stringify(apiSpec, null, 2));

    if (
      !latestApiSpecVersion ||
      (latestApiSpecVersion &&
        latestApiSpecVersion.graphqlRepresentation !== graphQlSchema)
    ) {
      DEBUG(`Creating a new API spec version.`);
      latestApiSpecVersion = await solutionSchemaApi.addApiSpecVersion(
        manifestConfig.apiSpec.externalId,
        graphQlSchema
      );
    }
    DEBUG(
      `Latest API spec version , %o`,
      JSON.stringify(latestApiSpecVersion, null, 2)
    );

    DEBUG(`Updating tables..`);
    const tablesResponse = await solutionSchemaApi.updateTables(
      manifestConfig.tables
    );

    DEBUG(
      `Tables were successfully updated , %o`,
      JSON.stringify(tablesResponse, null, 2)
    );

    DEBUG(`Updating apis..`);
    const apisResponse = await solutionSchemaApi.updateApis(
      manifestConfig.apis
    );

    DEBUG(
      'Apis were successfully updated, %o',
      JSON.stringify(apisResponse, null, 2)
    );
    Response.log(`Your solution was published successfully`);
  }
}

function readFile(filePath: string, fileType: string): string {
  DEBUG(`Reading the specified ${fileType} file`);
  const fileContents = readFileSync(filePath, {
    encoding: 'utf-8',
  }).toString();

  _DEBUG('File contents %o', fileContents);

  return fileContents;
}
export default new DeployCommand(
  'deploy',
  'Deploy graphql schema, create storage and bindings',
  commandArgs
);
