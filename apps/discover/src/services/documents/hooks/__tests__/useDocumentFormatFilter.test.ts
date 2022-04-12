import {
  useDocumentFormatFilter,
  useFormatDocumentFilters,
} from '../useDocumentFormatFilter';

jest.mock('modules/documentSearch/hooks/useLabelsQuery', () => ({
  useLabelsQuery: jest.fn(() => {
    return { 'unstructured-doctype-TEST_TYPE_1': 'TEST_TYPE_1' };
  }),
}));

describe('useDocumentFormatFilter', () => {
  const formatTag = useDocumentFormatFilter();

  it('formats the "labels" tag correctly', () => {
    const result = formatTag('labels', {
      externalId: 'unstructured-doctype-TEST_TYPE_1',
    });
    expect(result).toBe('Document Category: TEST_TYPE_1');
  });
  it('formats the "fileCategory" tag correctly', () => {
    const result = formatTag('fileCategory', 'Compressed');
    expect(result).toBe('File Type: Compressed');
  });
  it('formats the "created" tag correctly', () => {
    const result = formatTag('lastcreated', ['1175637600000', '1619042400000']);
    expect(result).toContain('Created: ');
  });

  it('expect error on invalid item to "labels"', () => {
    expect(() => formatTag('labels', { a: 'a' })).toThrow(
      new Error('Labels needs to be an object with externalId as property')
    );
  });
  it('expect error on invalid item to "lastmodified"', () => {
    expect(() => formatTag('lastmodified', 'a')).toThrow(
      new Error('Must be an array with [start, end] date')
    );
  });
  it('expect error on incorrect length to "lastmodified"', () => {
    expect(() => formatTag('lastmodified', ['1175637600000'])).toThrow(
      new Error('Must be an array with [start, end] date')
    );
  });
});

describe('useFormatDocumentFilters', () => {
  const formattedDocumentFilters = useFormatDocumentFilters();
  it('formats the "fileCategory" tag correctly', () => {
    const result = formattedDocumentFilters([
      ['fileCategory', ['PDF', 'IMAGE']],
    ]);
    expect(result).toMatchObject({
      'File Type': ['PDF', 'IMAGE'],
    });
  });

  it('formats the "location" tag correctly', () => {
    const result = formattedDocumentFilters([
      ['location', ['SOURCE_1', 'SOURCE_2']],
    ]);

    expect(result).toMatchObject({
      Source: ['SOURCE_1', 'SOURCE_2'],
    });
  });

  it('formats the "lastcreated" tag correctly', () => {
    const result = formattedDocumentFilters([
      ['lastcreated', ['1175637600000', '1619042400000']],
    ]);

    expect(result).toMatchObject({ Created: expect.any(Array) });
  });

  it('expect error on invalid item to "lastcreated"', () => {
    expect(() =>
      formattedDocumentFilters([['lastcreated', ['1175637600000']]])
    ).toThrow(new Error('Must be an array with [start, end] date'));
  });

  it('formats the "lastmodified" tag correctly', () => {
    const result = formattedDocumentFilters([
      ['lastmodified', ['1175637600000', '1619042400000']],
    ]);

    expect(result).toMatchObject({
      'Last Modified': expect.any(Array),
    });
  });

  it('expect error on invalid item to "lastmodified"', () => {
    expect(() =>
      formattedDocumentFilters([['lastmodified', ['1175637600000']]])
    ).toThrow(new Error('Must be an array with [start, end] date'));
  });

  it('formats the "label" tag correctly', () => {
    const result = formattedDocumentFilters([
      [
        'labels',
        [
          {
            externalId: 'unstructured-doctype-TEST_TYPE_1',
          },
        ],
      ],
    ]);

    expect(result).toMatchObject({ 'Document Category': ['TEST_TYPE_1'] });
  });
});
