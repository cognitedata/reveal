/* eslint-disable no-console */
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import createEventsByLineNumbers from './createEventsByLineNumbers';
import downloadFiles from './downloadFiles';
import parseFiles from './parseFiles';
import updateFileMetadata from './updateFileMetadata';
import uploadFiles from './uploadFiles';

const shamefulKeepProcessAlive = () => {
  const handle = setInterval(() => {
    return undefined;
  }, 5000);
  return () => clearInterval(handle);
};

type BaseCommandArguments = {
  outputVersion: string;
};

type ParseCommandArguments = BaseCommandArguments & {
  preferConnectionsFromFile: boolean;
};

const run = async () => {
  const onFinish = shamefulKeepProcessAlive();
  await yargs(hideBin(process.argv))
    .option('outputVersion', {
      type: 'string',
      describe: 'the version that files and events should be tagged with',
      demandOption: true,
    })
    .demandCommand(1, 1, 'Please provide a command')
    .command<ParseCommandArguments>({
      command: 'parse',
      describe: 'Parse graph documents in ./graphs to produce Linewalk output',
      handler: (argv) => parseFiles(argv),
    })
    .command<BaseCommandArguments>({
      command: 'download',
      describe: 'Download all graph documents from CDF to ./graphs',
      handler: downloadFiles,
    })
    .command<BaseCommandArguments>({
      command: 'upload',
      describe: "Upload all applicable documents from './documents to CDF",
      handler: uploadFiles,
    })
    .command<BaseCommandArguments>({
      command: 'updateMetadata',
      describe:
        'Parse all documents in ./documents and update PDFs and JSONs to contain line number metadata',
      handler: updateFileMetadata,
    })
    .command<BaseCommandArguments>({
      command: 'createEvents',
      describe:
        'Parse all documents in ./documents and create events for each line number',
      handler: createEventsByLineNumbers,
    })
    .command<BaseCommandArguments>({
      command: 'all',
      handler: async (argv) => {
        await downloadFiles(argv);
        await parseFiles(argv);
        await uploadFiles(argv);
        await updateFileMetadata(argv);
        await createEventsByLineNumbers(argv);
      },
    })
    .parse();
  onFinish();
};

run();
