/* eslint-disable no-console */
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import Argv from 'yargs';

import createSiteUnitEvents from './createSiteUnitEvents';
import downloadDwgFiles from './downloadDwgFiles';
import uploadDwgs from './uploadDwgs';
import uploadPdfAndSvgFiles from './uploadPdfAndSvgFiles';
import convertDwgToPdf from './convertDwgToPdf';
import convertPdfToSvg from './convertPdfToSvg';
import deleteDiagramParserFiles from './deleteDiagramParserFiles';

const shamefulKeepProcessAlive = () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const handle = setInterval(() => {}, 5000);
  return () => clearInterval(handle);
};

function addClientOptions<T>(yargs: Argv.Argv<T>) {
  return yargs
    .option('client-id', {
      type: 'string',
      describe: 'OIDC client id to use for creating a JS SDK client',
      demandOption: true,
    })
    .option('tenant-id', {
      type: 'string',
      describe: 'OIDC tenant id to use for creating a JS SDK client',
      demandOption: true,
    })
    .option('project', {
      type: 'string',
      describe: 'The name of the CDF project',
      demandOption: true,
    })
    .option('base-url', {
      type: 'string',
      describe:
        'Cognite base URL to the cluster, like "https://greenfield.cognitedata.com"',
      demandOption: true,
    })
    .option('client-secret', {
      type: 'string',
      describe:
        'client secret to use in a client credential for JS SDK client. Can be omitted to use implicit flow instead.',
    });
}

function addSiteUnitOptions<T>(yargs: Argv.Argv<T>) {
  return yargs
    .option('site', {
      type: 'string',
      describe: 'the name of the site',
      demandOption: true,
    })
    .option('unit', {
      type: 'string',
      describe: 'the name of the unit',
      demandOption: true,
    });
}

const run = async () => {
  const onFinish = shamefulKeepProcessAlive();
  const addAllOptions = (yargs) => addSiteUnitOptions(addClientOptions(yargs));
  yargs(hideBin(process.argv))
    .parserConfiguration({ 'camel-case-expansion': true })
    .command({
      command: 'create-site-unit-events',
      describe: 'Create site and unit events for Linewalk',
      handler: (argv) => createSiteUnitEvents(argv),
      builder: addAllOptions,
    })
    .command({
      command: 'download-dwg',
      describe: 'Download all DWGs from CDF for site and unit',
      handler: (argv) => downloadDwgFiles(argv),
      builder: addAllOptions,
    })
    .command({
      command: 'convert-dwg-to-pdf',
      describe: 'Convert DWGs in CDF to PDFs and download',
      handler: (argv) => convertDwgToPdf(argv),
      builder: addAllOptions,
    })
    .command({
      command: 'convert-pdf-to-svg',
      describe: 'Convert PDF to SVG with Inkscape',
      handler: (argv) => convertPdfToSvg(argv),
      builder: addSiteUnitOptions, // no client necessary
    })
    .command({
      command: 'upload-dwg',
      describe: 'Upload all DWGs to CDF',
      handler: (argv) => uploadDwgs(argv),
      builder: addAllOptions,
    })
    .command({
      command: 'upload-pdf-svg',
      describe: 'Upload all PDFs and SVGs from `dir` to CDF',
      handler: (argv) => uploadPdfAndSvgFiles(argv),
      builder: addAllOptions,
    })
    .command({
      command: 'delete-diagram-parser-files',
      describe: 'Upload all PDFs and SVGs from `dir` to CDF',
      handler: (argv) => deleteDiagramParserFiles(argv),
      builder: addAllOptions,
    })
    .command({
      command: 'all',
      describe:
        'Make DWGs accessible to the Diagram Parser by converting to PDF and SVG',
      handler: async (argv) => {
        await createSiteUnitEvents(argv);
        await uploadDwgs(argv);
        await convertDwgToPdf(argv);
        await convertPdfToSvg(argv);
        await uploadPdfAndSvgFiles(argv);
      },
      builder: addAllOptions,
    })
    .demandCommand(1, 1, 'Please provide a command')
    .parse();
  onFinish();
};

run();
