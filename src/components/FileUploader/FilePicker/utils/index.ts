import { CogsFile, WebkitFile } from '../types';

export * from './attrAccept';

let id = 0;
export function getUid() {
  // eslint-disable-next-line no-plusplus
  return `cogs-${Date.now()}-${id++}`;
}

export function convertFileToCogsFile(file: WebkitFile): CogsFile {
  const cogsFileProps: Omit<CogsFile, keyof File> = {
    uid: getUid(),
    relativePath: file.webkitRelativePath || '',
    status: 'idle',
    percent: 0,
  };
  return Object.assign(file, cogsFileProps);
}
