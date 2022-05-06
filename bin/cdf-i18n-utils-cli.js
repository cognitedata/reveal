#!/usr/bin/env node

require('dotenv').config();

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const pull = require('./pull');
const saveMissing = require('./save-missing');

function main() {
  yargs(hideBin(process.argv))
    .command(
      'pull [projectId] [namespace] [version] [path]',
      'downloads translations (overrides local files)',
      (yargs) => {
        return yargs
          .env('LOCIZE')
          .option('projectId', {
            alias: 'i',
            describe: 'The project id to use for operations',
            default: '0f0363e6-4ef6-49cf-8f1b-e0d993b4b828',
            type: 'string',
          })
          .option('namespace', {
            alias: 'n',
            describe: 'The namespace to target for translations',
            type: 'string',
            demandOption: true,
          })
          .option('version', {
            alias: 'v',
            describe: 'The version to target for translations',
            default: 'latest',
            type: 'string',
          })
          .option('path', {
            alias: 'p',
            describe: 'The path to download translations',
            default: './src/common/i18n/translations',
            type: 'string',
          });
      },
      (argv) => {
        pull({
          projectId: argv.projectId,
          namespace: argv.namespace,
          version: argv.version,
          path: argv.path,
        });
      }
    )
    .command(
      'save-missing [apiKey] [projectId] [namespace] [version] [path]',
      'saves missing keys to locize from your repository (does not update the existing values in locize)',
      (yargs) => {
        return yargs
          .env('LOCIZE')
          .option('apiKey', {
            alias: 'k',
            describe: 'The api key to use for operations',
            type: 'string',
            demandOption: true,
          })
          .option('projectId', {
            alias: 'i',
            describe: 'The project id to use for operations',
            default: '0f0363e6-4ef6-49cf-8f1b-e0d993b4b828',
            type: 'string',
          })
          .option('namespace', {
            alias: 'n',
            describe: 'The namespace to target for translations',
            type: 'string',
            demandOption: true,
          })
          .option('version', {
            alias: 'v',
            describe: 'The version to target for translations',
            default: 'staging',
            type: 'string',
          })
          .option('path', {
            alias: 'p',
            describe: 'The path to download translations',
            default: './src/common/i18n/translations',
            type: 'string',
          });
      },
      (argv) => {
        saveMissing({
          apiKey: argv.apiKey,
          projectId: argv.projectId,
          namespace: argv.namespace,
          version: argv.version,
          path: argv.path,
        });
      }
    )
    .option('verbose', {
      type: 'boolean',
      description: 'Run with verbose logging',
    })
    .version(false)
    .wrap(Math.min(200, yargs().terminalWidth()))
    .parse();
}

try {
  main();
} catch (error) {
  console.error(error);
}
