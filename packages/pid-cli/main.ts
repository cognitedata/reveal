/* eslint-disable no-console */
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import downloadFiles from './downloadFiles';
import parseFiles from './parseFiles';
import updateFileMetadata from './updateFileMetadata';
import uploadFiles from './uploadFiles';

const shamefulKeepProcessAlive = () => {
  const handle = setInterval(() => {}, 5000);
  return () => clearInterval(handle);
};

const run = async () => {
  const onFinish = shamefulKeepProcessAlive();
  await yargs(hideBin(process.argv))
    .command({
      command: 'parse',
      describe: 'Parse graph documents in ./graphs to produce Linewalk output',
      handler: (argv) => parseFiles(argv),
      builder: (yargs) =>
        yargs
          .option('prefer-connections-from-file', {
            type: 'boolean',
            describe: 'if connections should be read from file',
            default: false,
          })
          .option('output-version', {
            type: 'string',
            describe: 'the version infix to add to output file names',
            demandOption: true,
          }),
    })
    .command({
      command: 'download',
      describe: 'Download all graph documents from CDF to ./graphs',
      handler: downloadFiles,
    })
    .command({
      command: 'upload',
      describe: "Upload all applicable documents from './documents to CDF",
      handler: uploadFiles,
    })
    .command({
      command: 'update-metadata',
      describe:
        'Parse all documents in ./documents and update PDFs and JSONs to contain line number metadata',
      handler: updateFileMetadata,
    })
    .command({
      command: 'all',
      handler: async (argv) => {
        await downloadFiles();
        await parseFiles(argv);
        await uploadFiles();
        await updateFileMetadata();
      },
      builder: (yargs) =>
        yargs.option('output-version', {
          type: 'string',
          describe: 'the version infix to add to output file names',
          demandOption: true,
        }),
    })
    .demandCommand(1, 1, 'Please provide a command')
    .parse();
  onFinish();
};

run();
