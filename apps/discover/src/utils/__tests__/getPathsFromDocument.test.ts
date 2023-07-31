import { getPathsFromDoc } from 'utils/getPathsFromDocument';

import { getMockDocument } from '__test-utils/fixtures/document';

describe('getPathsFromDoc', () => {
  const mockDocument = getMockDocument();
  test('should return document paths correctly', () => {
    expect(getPathsFromDoc(mockDocument)).toEqual([mockDocument.fullFilePath]);
    expect(getPathsFromDoc(getMockDocument({ fullFilePath: '' }))).toEqual([]);

    expect(
      getPathsFromDoc(
        getMockDocument({
          duplicates: [getMockDocument({ fullFilePath: '/234' })],
          fullFilePath: '/123',
        })
      )
    ).toEqual(['/123', '/234']);
  });
});
