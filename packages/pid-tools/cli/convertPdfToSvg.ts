import { spawnSync } from 'child_process';
import fsPromises from 'fs/promises';

import getDataDirPath from './utils/getDataDirPath';

export const convertPdfToSvg = async (argv) => {
  const { site, unit } = argv as unknown as {
    site: string;
    unit: string;
  };
  const dir = getDataDirPath(site, unit);

  // eslint-disable-next-line no-console
  console.log(`Converting PDFs to SVGs in directory: ${dir}`);

  const fileNames = await fsPromises.readdir(dir);
  const pdfFiles = fileNames.filter((fileName) => fileName.endsWith('.pdf'));

  // eslint-disable-next-line no-restricted-syntax
  for (const [i, pdfFile] of pdfFiles.entries()) {
    spawnSync('inkscape', ['--export-type=svg', `${dir}/${pdfFile}`]);

    // eslint-disable-next-line no-console
    console.log(
      `${i + 1}/${pdfFiles.length}: Converted file to svg ${pdfFile}`
    );
  }
};

export default convertPdfToSvg;
