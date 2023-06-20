import { render, screen } from '@testing-library/react';

import { FilterState } from '@data-exploration-lib/core';

import { TimeseriesFilters } from './TimeseriesFilters';

describe('TimeseriesFilters', () => {
  describe('Base', () => {
    test('Show no options in the list', () => {
      const mockFilter: FilterState = {
        common: {},
        asset: {},
        timeSeries: {},
        sequence: {},
        file: {},
        event: {},
        document: {},
        threeD: {},
      };

      render(
        <TimeseriesFilters
          filter={mockFilter}
          onFilterChange={() => jest.fn()}
          onResetFilterClick={() => jest.fn()}
          query=""
        />
      );
      expect(screen.getByText(/time series/gi)).toBeInTheDocument();
    });
  });
});
