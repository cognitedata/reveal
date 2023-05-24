import React from 'react';
import { render, screen } from '@testing-library/react';
import { TimeseriesFilters } from './TimeseriesFilters';

describe('TimeseriesFilters', () => {
  describe('Base', () => {
    test('Show no options in the list', () => {
      const mockFilter = {
        common: {},
        asset: {},
        timeseries: {},
        sequence: {},
        file: {},
        event: {},
        document: {},
      };

      render(
        <TimeseriesFilters
          filter={mockFilter}
          onFilterChange={() => jest.fn()}
          onResetFilterClick={() => jest.fn()}
        />
      );
      expect(screen.getByText(/time series/gi)).toBeInTheDocument();
    });
  });
});
