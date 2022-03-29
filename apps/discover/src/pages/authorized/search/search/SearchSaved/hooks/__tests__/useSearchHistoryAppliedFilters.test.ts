import '__mocks/mockContainerAuth'; // should be first

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { getMockGeoJson } from '__test-utils/fixtures/geometry';
import {
  getMockDocumentFilter,
  getMockWellFilterExtra,
} from '__test-utils/fixtures/sidebar';
import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

import { GEO_FILTER_ENABLED } from '../../constants';
import { useSearchHistoryAppliedFilters } from '../useSearchHistoryAppliedFilters';

const getHookResult = async () => {
  const { waitForNextUpdate, result } = renderHook(
    () => useSearchHistoryAppliedFilters(),
    { wrapper: QueryClientWrapper }
  );

  await waitForNextUpdate();

  return result.current;
};

const mockServer = setupServer(getMockConfigGet());

describe('useSearchHistoryAppliedFilters', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('Curates the correct document filters based on saved search history', async () => {
    const getSearchHistoryFilters = await getHookResult();

    const { count, filters } = getSearchHistoryFilters({
      filters: {
        documents: {
          facets: {
            ...getMockDocumentFilter(),
          },
        },
      },
    });

    expect(count).toBe(4);

    const documents = filters.find((item) => item.label === 'documents');
    expect(documents?.values).toEqual([
      'File Type: Compressed, Image',
      'Document Category: 1',
      'Source: Bp-Blob',
      'Page Count: 2 - 3',
    ]);

    const wells = filters.find((item) => item.label === 'wells');
    expect(wells?.values).toEqual([]);

    const geoJson = filters.find((item) => item.label === 'geoJson');
    expect(geoJson?.values).toEqual([]);
  });

  it('Curates the correct wells filters based on saved search history', async () => {
    const getSearchHistoryFilters = await getHookResult();

    const { count, filters } = getSearchHistoryFilters({
      filters: {
        wells: {
          ...getMockWellFilterExtra,
        },
      },
    });

    expect(count).toBe(9);

    const documents = filters.find((item) => item.label === 'documents');
    expect(documents?.values).toEqual([]);

    const wells = filters.find((item) => item.label === 'wells');
    expect(wells?.values).toEqual([
      'Region: Jovian System',
      'Field: Ganymede, Carme group',
      'Operator: Cognite',
      'Data Availability: NDS events',
      'Measurements: caliper',
      'Well Type: Abandoned, Exploration',
      'NDS Risk Type: Casing',
      'NPT Code: DFAL',
      'NPT Detail Code: BARR, BHA, CASE, CEQP, CODE, COIL, CWOR, CMTO',
    ]);

    const geoJson = filters.find((item) => item.label === 'geoJson');
    expect(geoJson?.values).toEqual([]);
  });

  it('Curates the correct geo filters based on saved search history', async () => {
    const getSearchHistoryFilters = await getHookResult();

    const { count, filters } = getSearchHistoryFilters({
      filters: {},
      geoJson: [getMockGeoJson()],
    });

    expect(count).toBe(1);

    const documents = filters.find((item) => item.label === 'documents');
    expect(documents?.values).toEqual([]);

    const wells = filters.find((item) => item.label === 'wells');
    expect(wells?.values).toEqual([]);

    const geoJson = filters.find((item) => item.label === 'geoJson');
    expect(geoJson?.values).toEqual([GEO_FILTER_ENABLED]);
  });
});
