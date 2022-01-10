import { getPathsFromDoc } from 'utils/getPathsFromDocument';

import { getMockDocument } from '__test-utils/fixtures/document';

describe('getPathsFromDoc', () => {
  test('should return document paths correctly', () => {
    expect(
      getPathsFromDoc(getMockDocument(undefined, { filepath: '/123' }))
    ).toEqual(['/123']);
    expect(
      getPathsFromDoc(getMockDocument(undefined, { filepath: '' }))
    ).toEqual([]);

    expect(
      getPathsFromDoc(
        getMockDocument(
          { duplicates: [getMockDocument(undefined, { filepath: '/234' })] },
          { filepath: '/123' }
        )
      )
    ).toEqual(['/123', '/234']);
  });
});
