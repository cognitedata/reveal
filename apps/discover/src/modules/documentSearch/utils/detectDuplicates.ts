import { DocumentType } from '../types';

export const detectDuplicates = (originalList: DocumentType[]) => {
  const seen = new Map<string, DocumentType[]>();
  originalList.forEach((originalDocument) => {
    const metadata = originalDocument.doc;
    if (metadata) {
      const key = `${metadata.filename}|${metadata.filesize}|${metadata.lastmodified}`;
      const val = seen.get(key);
      if (val) {
        val.push(originalDocument);
      } else {
        seen.set(key, [originalDocument]);
      }
    }
  });
  const filtered: DocumentType[] = [];
  seen.forEach((list) => {
    if (list.length === 1) {
      filtered.push(list[0]);
    } else {
      const [, ...duplicates] = list;
      const first = list[0];
      const fileName = `${first.doc.filename} (${duplicates.length + 1})`;
      first.doc.filename = fileName;
      first.duplicates = duplicates;
      filtered.push(first);
    }
  });
  return filtered;
};
