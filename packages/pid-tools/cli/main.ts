/* eslint-disable no-console */
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import downloadDwgFiles from './downloadDwgFiles';
import uploadPdfAndSvgFiles from './uploadPdfAndSvgFiles';
import convertDwgToPdf from './convertDwgToPdf';
import convertPdfToSvg from './convertPdfToSvg';
import deleteDiagramParserFiles from './deleteDiagramParserFiles';

const shamefulKeepProcessAlive = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handle = setInterval(() => {}, 5000);
  return () => clearInterval(handle);
};

const run = async () => {
  const onFinish = shamefulKeepProcessAlive();
  await yargs(hideBin(process.argv))
    .command({
      command: 'download-dwg',
      describe:
        'Download all DWGs from CDF with unit `unit` to directory `dir`',
      handler: (argv) => downloadDwgFiles(argv),
      builder: (yargs) =>
        yargs
          .option('unit', {
            type: 'string',
            describe: 'the unit of the files to download',
            demandOption: true,
          })
          .option('dir', {
            type: 'string',
            describe: 'the directory to download the files',
            demandOption: true,
          }),
    })
    .command({
      command: 'convert-dwg-to-pdf',
      describe: 'Convert DWGs in CDF to PDFs and download to `dir`',
      handler: (argv) => convertDwgToPdf(argv),
      builder: (yargs) =>
        yargs
          .option('unit', {
            type: 'string',
            describe: 'unit for the DWGs to convert',
            demandOption: true,
          })
          .option('dir', {
            type: 'string',
            describe: 'directory to download the files',
            demandOption: true,
          }),
    })
    .command({
      command: 'convert-pdf-to-svg',
      describe: 'Convert PDF to SVG with Inkscape',
      handler: (argv) => convertPdfToSvg(argv),
      builder: (yargs) =>
        yargs.option('dir', {
          type: 'string',
          describe: 'directory to read the PDFs and save SVGs',
          demandOption: true,
        }),
    })
    .command({
      command: 'upload-pdf-svg',
      describe: 'Upload all PDFs and SVGs from `dir` to CDF',
      handler: (argv) => uploadPdfAndSvgFiles(argv),
      builder: (yargs) =>
        yargs.option('dir', {
          type: 'string',
          describe: 'the directory with PDFs and SVGs to upload',
          demandOption: true,
        }),
    })
    .command({
      command: 'delete-diagram-parser-files',
      describe: 'Upload all PDFs and SVGs from `dir` to CDF',
      handler: (argv) => deleteDiagramParserFiles(argv),
      builder: (yargs) =>
        yargs.option('unit', {
          type: 'string',
          describe: 'unit for the DWGs to convert',
          demandOption: true,
        }),
    })
    .command({
      command: 'all',
      describe:
        'Make DWGs accessible to the Diagram Parser by converting to PDF and SVG',
      handler: async (argv) => {
        await convertDwgToPdf(argv);
        await convertPdfToSvg(argv);
        await uploadPdfAndSvgFiles(argv);
      },
      builder: (yargs) =>
        yargs
          .option('unit', {
            type: 'string',
            describe: 'the unit of the files to download',
            demandOption: true,
          })
          .option('dir', {
            type: 'string',
            describe: 'the directory with PDFs and SVGs to upload',
            demandOption: true,
          }),
    })
    .demandCommand(1, 1, 'Please provide a command')
    .parse();
  onFinish();
};

run();
