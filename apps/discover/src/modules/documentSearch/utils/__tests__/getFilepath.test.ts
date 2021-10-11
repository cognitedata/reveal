import { getMockApiResultItem } from '__test-utils/fixtures/document';

import { getFilepath } from '../getFilepath';

describe('getFilepath', () => {
  it('should return file path', () => {
    const doc = getMockApiResultItem();
    const filePath = getFilepath(doc);
    expect(filePath).toEqual('/folder1/folder2');
  });

  it('should not fail on crazy regex breaking name', () => {
    const doc = getMockApiResultItem(
      {},
      {
        name: '****',
      }
    );
    const filePath = getFilepath(doc);
    expect(filePath).toEqual('/folder1/folder2');
  });

  it('should not throw errors when directory is not defined', () => {
    const doc = getMockApiResultItem();
    delete doc.sourceFile.directory;
    const filePath = getFilepath(doc);
    expect(filePath).toEqual('/folder1/folder2');
  });

  it('should not throw errors when both directory and metadata.parentPath is not defined', () => {
    const doc = getMockApiResultItem();
    delete doc.sourceFile.directory;
    delete doc.sourceFile?.metadata?.parentPath;
    const filePath = getFilepath(doc);
    expect(filePath).toEqual('/folder1/folder2/');
  });

  it('should not throw errors when neither directory nor metadata.parentPath nor metadata.path is not defined', () => {
    const doc = getMockApiResultItem();
    delete doc.sourceFile.directory;
    delete doc.sourceFile?.metadata?.parentPath;
    delete doc.sourceFile?.metadata?.path;
    const filePath = getFilepath(doc);
    expect(filePath).toEqual('');
  });
});
