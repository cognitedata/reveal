#!/usr/bin/env node

require('dotenv').config();

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const pull = require('./pull');
const saveMissing = require('./save-missing');
const removeDeleted = require('./remove-deleted');
const sortLocalKeys = require('./sort-local-keys');

function main() {
  yargs(hideBin(process.argv))
    .env('LOCIZE')
    .command(
      'pull-keys-from-remote [projectId] [namespace] [productionVersion] [path]',
      'downloads translations from remote (overrides local files)',
      (yargs) => {
        return yargs
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
          .option('productionVersion', {
            describe: 'The production version to pull translations',
            default: 'production',
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
          version: argv.productionVersion,
          path: argv.path,
        });
      }
    )
    .command(
      'save-missing-keys-to-remote [projectId] [namespace] [stagingVersion] [path]',
      'saves missing keys to remote staging version (does not update the existing values in locize)',
      (yargs) => {
        return yargs
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
          .option('stagingVersion', {
            describe: 'The staging version to use for operations',
            default: 'latest',
            type: 'string',
          })
          .option('path', {
            alias: 'p',
            describe: 'The path to read local translations',
            default: './src/common/i18n/translations',
            type: 'string',
          });
      },
      (argv) => {
        saveMissing({
          apiKey: argv.apiKey,
          projectId: argv.projectId,
          namespace: argv.namespace,
          version: argv.stagingVersion,
          path: argv.path,
        });
      }
    )
    .command(
      'remove-deleted-keys-from-remote [projectId] [namespace] [stagingVersion] [path]',
      'removes deleted keys from remote staging version',
      (yargs) => {
        return yargs
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
          .option('stagingVersion', {
            describe: 'The staging version to use for operations',
            default: 'latest',
            type: 'string',
          })
          .option('path', {
            alias: 'p',
            describe: 'The path to read local translations',
            default: './src/common/i18n/translations',
            type: 'string',
          });
      },
      (argv) => {
        removeDeleted({
          apiKey: argv.apiKey,
          projectId: argv.projectId,
          namespace: argv.namespace,
          version: argv.stagingVersion,
          path: argv.path,
        });
      }
    )
    .command(
      'sort-local-keys [path] [sourceLanguage]',
      'sorts local files',
      (yargs) => {
        return yargs
          .option('path', {
            alias: 'p',
            describe: 'The path to read local translations',
            default: './src/common/i18n/translations',
            type: 'string',
          })
          .option('sourceLanguage', {
            describe: 'The source language to sort files',
            default: 'en',
            type: 'string',
          });
      },
      (argv) => {
        sortLocalKeys({
          path: argv.path,
          sourceLanguage: argv.sourceLanguage,
        });
      }
    )
    .option('verbose', {
      type: 'boolean',
      description: 'Run with verbose logging',
    })
    .demandCommand(1, 'You need to provide a command')
    .version(false)
    .wrap(Math.min(200, yargs().terminalWidth()))
    .parse();
}

try {
  main();
} catch (error) {
  console.error(error);
}
