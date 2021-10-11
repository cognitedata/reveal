import {
  getMockFormattedFacet,
  getMockFilterValue,
} from '__test-utils/fixtures/sidebar';

import { GEO_FILTER_ENABLED, NO_FILTERS } from '../constants';
import {
  formatFacetsToStringLabels,
  formatWellFiltersToStringLabels,
  elipsisFilters,
  formatAllFiltersToAString,
} from '../utils';

describe('Test formatFacetsToStringLabels', () => {
  it('Should manipulate well filters to string array ( One filter applied )', async () => {
    const formattedFacets = [getMockFormattedFacet()];
    const result = formatFacetsToStringLabels(formattedFacets);
    expect(result.length).toEqual(1);
    expect(result).toContain('File Type: PDF');
  });

  it('Should manipulate well filters to string array ( Multiple filters applied )', async () => {
    const formattedFacets = [
      getMockFormattedFacet(),
      getMockFormattedFacet({ facetValueDisplayFormat: 'IMAGE' }),
      getMockFormattedFacet({
        facet: 'location',
        facetNameDisplayFormat: 'Location',
        facetValueDisplayFormat: 'LOCATION 1',
      }),
      getMockFormattedFacet({
        facet: 'location',
        facetNameDisplayFormat: 'Location',
        facetValueDisplayFormat: 'LOCATION 2',
      }),
    ];
    const result = formatFacetsToStringLabels(formattedFacets);
    expect(result.length).toEqual(2);
    expect(result).toContain('File Type: PDF, IMAGE;');
    expect(result).toContain('Location: LOCATION 1, LOCATION 2;');
  });
});

describe('Test elipsisFilters', () => {
  const filters = [
    'Field1 : Value1, Value2;',
    'Field2 : Value3, Value4;',
    'Field3 : Value5, Value6;',
  ];
  it('All filters can fit into num of characters', async () => {
    const result = elipsisFilters(filters, 100);
    expect(result).toEqual(
      'Field1 : Value1, Value2; Field2 : Value3, Value4; Field3 : Value5, Value6;'
    );
  });
  it('One filter can fit into num of characters and two is out', async () => {
    const result = elipsisFilters(filters, 30);
    expect(result).toEqual('Field1 : Value1, Value2; +2');
  });
  it('Two filters can fit into num of characters and one is out', async () => {
    const result = elipsisFilters(filters, 60);
    expect(result).toEqual(
      'Field1 : Value1, Value2; Field2 : Value3, Value4; +1'
    );
  });
});

describe('Test formatWellFiltersToStringLabels', () => {
  it('Should manipulate facets to string array', async () => {
    const formattedWellFilters = [
      getMockFilterValue(),
      getMockFilterValue({ value: 'PAR', displayName: 'PAR' }),
      getMockFilterValue({
        id: 0,
        category: 'Category 1',
        field: 'Block',
        value: '15/9',
        displayName: '15/9',
      }),
      getMockFilterValue({
        id: 0,
        category: 'Category 1',
        field: 'Block',
        value: '33/4',
        displayName: '33/4',
      }),
    ];
    const result = formatWellFiltersToStringLabels(formattedWellFilters);
    expect(result.length).toEqual(2);
    expect(result).toContain('Source: EDM, PAR;');
    expect(result).toContain('Source: EDM, PAR;');
  });
});

describe('Test formatAllFiltersToAString', () => {
  const mockDocumentFacets = [
    getMockFormattedFacet(),
    getMockFormattedFacet({ facetValueDisplayFormat: 'IMAGE' }),
  ];
  const mockWellFilters = [
    getMockFilterValue(),
    getMockFilterValue({ value: 'PAR', displayName: 'PAR' }),
  ];
  it('Filters with no geo json', () => {
    const result = formatAllFiltersToAString(
      mockDocumentFacets,
      mockWellFilters,
      []
    );
    expect(result).not.toContain(GEO_FILTER_ENABLED);
    expect(result).not.toContain(NO_FILTERS);
  });
  it('Filters with geo json', () => {
    const result = formatAllFiltersToAString(
      mockDocumentFacets,
      mockWellFilters,
      [{ id: 'iddd', geometry: { type: 'Point', coordinates: [1, 1] } }],
      300
    );
    expect(result).toContain(GEO_FILTER_ENABLED);
    expect(result).not.toContain(NO_FILTERS);
  });
  it('No Filters', () => {
    const result = formatAllFiltersToAString([], [], [], 300);
    expect(result).toContain(NO_FILTERS);
  });
});
