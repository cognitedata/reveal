const BASE_DIR = './cli/data';

const getDataDirPath = (site: string, unit: string): string =>
  `${BASE_DIR}/${site}/${unit}`;

export default getDataDirPath;
