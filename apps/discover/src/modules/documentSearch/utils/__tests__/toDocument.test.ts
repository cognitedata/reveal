import {
  getDocumentFixture,
  getHighlightContentFixture,
} from 'domain/documents/service/__fixtures/getDocumentFixture';

import { toDocument } from '../toDocument';

describe('toDocument', () => {
  it('should be ok', () => {
    const doc = toDocument({ item: getDocumentFixture() });
    expect(doc.id).toEqual('123');
    expect(doc.externalId).toEqual('aa123aa');
  });

  it('check asset id mapping', () => {
    const { doc } = toDocument({ item: getDocumentFixture() });
    expect(doc.assetIds).toEqual([1, 2, 3]);
  });

  it('should find labels', () => {
    const { doc } = toDocument({ item: getDocumentFixture() });
    expect(doc.labels).toEqual([
      { externalId: 'Unknown' },
      { externalId: 'Label-1-ID' },
    ]);
  });

  it('should find lastmodified', () => {
    const doc = toDocument({ item: getDocumentFixture() });
    expect(doc.modifiedDisplay).toContain('01-Apr-2014');
  });

  it('should find fileCategory', () => {
    const { doc } = toDocument({ item: getDocumentFixture() });
    expect(doc.fileCategory).toEqual('PDF');
  });

  it('should find title', () => {
    const { doc } = toDocument({ item: getDocumentFixture() });
    expect(doc.title).toEqual('Chapter 5 pressure tests.xlsx');
  });

  it('should find geolocation', () => {
    const doc = toDocument({ item: getDocumentFixture() });
    expect(doc.geolocation).toEqual({
      coordinates: [
        [
          [1, 1],
          [2, 2],
          [3, 3],
        ],
      ],
      type: 'Polygon',
    });
  });

  it('should return correct top folder', () => {
    // get top folder from directory
    const doc = toDocument({ item: getDocumentFixture() });
    expect(doc.doc.topfolder).toEqual('folder1');

    // get top folder from path
    const doc1 = toDocument({
      item: {
        ...getDocumentFixture(),
        sourceFile: {
          name: 'doc1',
          metadata: { path: '/pathfolder1/pathfolder2/filename' },
        },
      },
    });
    expect(doc1.doc.topfolder).toEqual('pathfolder1');

    // unknown if no directory parentPath or path are provided
    const doc2 = toDocument({
      item: {
        ...getDocumentFixture(),
        sourceFile: {
          name: 'doc1',
          metadata: { path: '', parentPath: '' },
        },
      },
    });
    expect(doc2.doc.topfolder).toEqual('');
  });

  it('should have correct highlight', () => {
    const highlightContent = getHighlightContentFixture();
    const { highlight } = toDocument({
      item: getDocumentFixture(),
      highlight: highlightContent,
    });
    expect(highlight).toEqual({ content: highlightContent.content });
  });
});
