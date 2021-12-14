import { DocumentFilterCategoryTitles } from 'modules/documentSearch/types';

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
  it('formats the "filetype" tag correctly', () => {
    const result = formatTag('filetype', 'Compressed');
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

describe('useHumanizeDocumentFilters', () => {
  const formattedDocumentFilters = useFormatDocumentFilters();
  it('formats the "filetype" tag correctly', () => {
    const result = formattedDocumentFilters([['filetype', ['PDF', 'IMAGE']]]);
    expect(result.length).toBe(2);
    expect(result).toContainEqual({
      facet: 'filetype',
      facetNameDisplayFormat: 'File Type',
      facetValueDisplayFormat: 'File Type: PDF',
    });
    expect(result).toContainEqual({
      facet: 'filetype',
      facetNameDisplayFormat: DocumentFilterCategoryTitles.filetype,
      facetValueDisplayFormat: 'File Type: IMAGE',
    });
  });

  it('formats the "location" tag correctly', () => {
    const result = formattedDocumentFilters([
      ['location', ['SOURCE_1', 'SOURCE_2']],
    ]);
    expect(result.length).toBe(2);
    expect(result).toContainEqual({
      facet: 'location',
      facetNameDisplayFormat: DocumentFilterCategoryTitles.location,
      facetValueDisplayFormat: 'Source: SOURCE_1',
    });
    expect(result).toContainEqual({
      facet: 'location',
      facetNameDisplayFormat: DocumentFilterCategoryTitles.location,
      facetValueDisplayFormat: 'Source: SOURCE_2',
    });
  });

  it('formats the "lastcreated" tag correctly', () => {
    const result = formattedDocumentFilters([
      ['lastcreated', ['1175637600000', '1619042400000']],
    ]);
    expect(result.length).toBe(1);
    expect(result[0].facet).toBe('lastcreated');
    expect(result[0].facetNameDisplayFormat).toBe('Created');
    expect(result[0].facetValueDisplayFormat).toContain('Created: ');
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
    expect(result.length).toBe(1);
    expect(result[0].facet).toBe('lastmodified');
    expect(result[0].facetNameDisplayFormat).toBe('Last Modified');
    expect(result[0].facetValueDisplayFormat).toContain('Last Modified: ');
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
    expect(result.length).toBe(1);
    expect(result[0].facet).toBe('labels');
    expect(result[0].facetNameDisplayFormat).toBe(
      DocumentFilterCategoryTitles.labels
    );
    expect(result[0].facetValueDisplayFormat).toBe(
      'Document Category: TEST_TYPE_1'
    );
  });
});
