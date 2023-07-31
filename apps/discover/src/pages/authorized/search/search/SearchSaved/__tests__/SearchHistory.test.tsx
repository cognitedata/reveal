import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { SearchHistory } from '../components/SearchHistory';
import { NO_FILTERS } from '../constants';

const page = (viewProps?: any) =>
  testRenderer(SearchHistory, undefined, viewProps);
describe('SearchHistory', () => {
  it(`Contains "${NO_FILTERS}" when no filters are applied`, async () => {
    page({ query: 'test query', filters: [], count: 0 });

    await screen.findByText('test query');
    await screen.findByText(NO_FILTERS);
  });

  it('Shows the tooltip with filters', async () => {
    page({
      query: 'test query',
      filters: [{ label: 'Documents', values: ['Source: Sol'] }],
      count: 1,
    });

    fireEvent.mouseEnter(screen.getByTestId('search-history-filters'), {
      bubbles: true,
    });

    await screen.findByText('Source: Sol');
    await screen.findByRole('tooltip');
    expect(screen.getByTestId('search-history-info')).toBeInTheDocument();
  });
});
