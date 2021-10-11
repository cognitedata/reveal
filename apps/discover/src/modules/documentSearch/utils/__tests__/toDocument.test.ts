import { getMockApiResultItem } from '__test-utils/fixtures/document';

import { filterTitle, toDocument } from '../toDocument';

describe('toDocument', () => {
  it('should be ok', () => {
    const doc = toDocument({ item: getMockApiResultItem() });
    expect(doc.id).toEqual('123');
    expect(doc.externalId).toEqual('aa123aa');
  });

  it('check asset id mapping', () => {
    const { doc } = toDocument({ item: getMockApiResultItem() });
    expect(doc.assetIds).toEqual([1, 2, 3]);
  });

  it('filter title', () => {
    const nullTitle = filterTitle();
    expect(nullTitle).toBe(undefined);

    const existingTitle = filterTitle('document1');
    expect(existingTitle).toBe('');

    const existingCapitalTitle = filterTitle('Powerpoint Presentation');
    expect(existingCapitalTitle).toBe('');

    const uniqueTitle = filterTitle('unique');
    expect(uniqueTitle).toBe('unique');
  });

  it('should find labels', () => {
    const { doc } = toDocument({ item: getMockApiResultItem() });
    expect(doc.labels).toEqual([
      { externalId: 'Unknown' },
      { externalId: 'Label-1-ID' },
    ]);
  });

  it('should find lastmodified', () => {
    const { doc } = toDocument({ item: getMockApiResultItem() });
    expect(doc.lastmodified).toContain('2014-04-01');
  });

  it('should find filetype', () => {
    const { doc } = toDocument({ item: getMockApiResultItem() });
    expect(doc.filetype).toEqual('PDF');
  });

  it('should find title', () => {
    const { doc } = toDocument({ item: getMockApiResultItem() });
    expect(doc.title).toEqual('Chapter 5 pressure tests.xlsx');
  });

  it('should find geolocation', () => {
    const doc = toDocument({ item: getMockApiResultItem() });
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
    const doc = toDocument({ item: getMockApiResultItem() });
    expect(doc.doc.topfolder).toEqual('folder1');

    // get top folder from path
    const doc1 = toDocument({
      item: {
        ...getMockApiResultItem(),
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
        ...getMockApiResultItem(),
        sourceFile: {
          name: 'doc1',
          metadata: { path: '', parentPath: '' },
        },
      },
    });
    expect(doc2.doc.topfolder).toEqual('Unknown');
  });
});
