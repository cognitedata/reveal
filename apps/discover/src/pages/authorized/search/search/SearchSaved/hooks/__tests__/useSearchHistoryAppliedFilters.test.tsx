import '__mocks/mockContainerAuth';
import { QueryClient } from 'react-query';

import { screen } from '@testing-library/react'; // should be first
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { getMockLabels } from 'services/labels/__mocks/getMockLabels';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockUserMe } from 'services/userManagementService/__mocks/mockUmsMe';

import { getMockGeoJson } from '__test-utils/fixtures/geometry';
import {
  getMockDocumentFilter,
  getMockWellFilterExtra,
} from '__test-utils/fixtures/sidebar';
import { QueryClientWrapper } from '__test-utils/queryClientWrapper';
import { testRendererForHooks } from '__test-utils/renderer';

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

const mockServer = setupServer(
  getMockConfigGet(),
  getMockUserMe(),
  getMockLabels()
);

describe('useSearchHistoryAppliedFilters', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());
  const queryClient = new QueryClient();
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
    const Component = () => {
      const getSearchHistoryFilters = useSearchHistoryAppliedFilters();

      const { count, filters } = getSearchHistoryFilters({
        filters: {
          wells: {
            ...getMockWellFilterExtra,
          },
        },
      });

      const documents = filters.find((item) => item.label === 'documents');
      const wells = filters.find((item) => item.label === 'wells');

      const geoJson = filters.find((item) => item.label === 'geoJson');

      return (
        <>
          <div>{`count: ${count}`}</div>

          {documents &&
            documents.values.map((document) => {
              return (
                <div data-testid="document-filter" key={document}>
                  {document}
                </div>
              );
            })}

          {wells &&
            wells.values.map((well) => {
              return (
                <div data-testid="well-filter" key={well}>
                  {well}
                </div>
              );
            })}

          {geoJson &&
            geoJson.values.map((geo) => {
              return (
                <div data-testid="geo-filter" key={geo}>
                  {geo}
                </div>
              );
            })}
        </>
      );
    };

    testRendererForHooks(Component, queryClient);

    await screen.findByText(`count: 9`);
    expect(screen.queryAllByTestId('document-filter')).toEqual([]);
    expect(screen.queryAllByTestId('geo-filter')).toEqual([]);

    expect(screen.queryAllByTestId('well-filter').length).toEqual(9);
    expect(screen.getByText('Region: Jovian System')).toBeInTheDocument();
    expect(
      screen.getByText('Field: Ganymede, Carme group')
    ).toBeInTheDocument();
    expect(screen.getByText('Operator: Cognite')).toBeInTheDocument();
    expect(
      screen.getByText('Data Availability: NDS events')
    ).toBeInTheDocument();
    expect(screen.getByText('Measurements: caliper')).toBeInTheDocument();
    expect(
      screen.getByText('Well Type: Abandoned, Exploration')
    ).toBeInTheDocument();
    expect(screen.getByText('NDS Risk Type: Casing')).toBeInTheDocument();
    expect(screen.getByText('NPT Code: DFAL')).toBeInTheDocument();
    expect(
      screen.getByText(
        'NPT Detail Code: BARR, BHA, CASE, CEQP, CODE, COIL, CWOR, CMTO'
      )
    ).toBeInTheDocument();
    // expect(wells?.values).toEqual([
    //   'Region: Jovian System',
    //   'Field: Ganymede, Carme group',
    //   'Operator: Cognite',
    //   'Data Availability: NDS events',
    //   'Measurements: caliper',
    //   'Well Type: Abandoned, Exploration',
    //   'NDS Risk Type: Casing',
    //   'NPT Code: DFAL',
    //   'NPT Detail Code: BARR, BHA, CASE, CEQP, CODE, COIL, CWOR, CMTO',
    // ]);
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
