/*!
 * Copyright 2019 Cognite AS
 */

export type FileIdToFilenameMap = Map<number, string>;

export async function loadLocalFileMap(sectorsFilesUrl: string): Promise<FileIdToFilenameMap> {
  const res = await fetch(sectorsFilesUrl);
  if (!res.ok) {
    throw new Error(`Could not fetch ${sectorsFilesUrl}, got ${res.status}`);
  }
  const content = await res.text();
  const lines = content.split('\n').filter(line => line.length > 0);
  const fileMap = new Map<number, string>();
  lines.forEach(line => {
    const [fileIdStr, name] = line.split('\t').filter(x => x.trim() !== '');
    const fileId = parseInt(fileIdStr, 10);
    fileMap.set(fileId, name.trim());
  });
  return fileMap;
}
