import { DocumentType } from './types';

// this function groups documents that are duplicates together
export const detectDuplicates = (docs: DocumentType[]) => {
  const seen = new Map<string, DocumentType[]>();

  docs.forEach((doc) => {
    const metadata = doc.doc;
    if (metadata) {
      const key = `${metadata.filename}|${metadata.filesize}`;
      const val = seen.get(key);
      if (val) {
        val.push(doc);
      } else {
        seen.set(key, [doc]);
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
