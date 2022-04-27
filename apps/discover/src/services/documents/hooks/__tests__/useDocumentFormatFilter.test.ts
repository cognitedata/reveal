import '__mocks/mockCogniteSDK';
import '__mocks/mockContainerAuth';

import { setupServer } from 'msw/node';
import { getMockLabelsPost } from 'services/labels/__mocks/getMockLabels';

import { renderHookWithStore } from '__test-utils/renderer';

import { useFormatDocumentFilters } from '../useFormatDocumentFilters';

describe('useFormatDocumentFilters', () => {
  const mockServer = setupServer(getMockLabelsPost());
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const { result, waitForNextUpdate } = renderHookWithStore(() =>
    useFormatDocumentFilters()
  );

  waitForNextUpdate();

  const formattedDocumentFilters = result.current;

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
            externalId: 'TEST_TYPE_1',
          },
        ],
      ],
    ]);

    expect(result).toMatchObject({ 'Document Category': ['TEST_TYPE_1'] });
  });
});
