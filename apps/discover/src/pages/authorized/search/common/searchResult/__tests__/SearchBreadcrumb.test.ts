import { screen, fireEvent } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { SearchBreadcrumb, Props } from '../SearchBreadCrumb';

describe('SearchBreadcrumb', () => {
  const Page = (viewStore: Store, viewProps?: Props) =>
    testRenderer(SearchBreadcrumb, viewStore, viewProps);
  const store = getMockedStore();

  it('should show bread crumb with total results & current hits with label', () => {
    Page(store, {
      stats: [
        {
          label: 'Documents',
          totalResults: 300,
          currentHits: 23,
        },
      ],
    });
    expect(screen.getByText('Documents: 23 / 300')).toBeInTheDocument();
  });

  it('should show bread crumb with total results & current hits with Showing label when no label is passed', () => {
    Page(store, {
      stats: [
        {
          totalResults: 56,
          currentHits: 28,
        },
      ],
    });
    expect(screen.getByText('Showing: 28 / 56')).toBeInTheDocument();
  });

  it('should show bread crumb with current hits & entityLabel is passed', () => {
    Page(store, {
      stats: [
        {
          currentHits: 28,
          entityLabel: 'files',
        },
      ],
    });
    expect(screen.getByText('Showing: 28 files')).toBeInTheDocument();
  });

  it('should show bread crumb with current hits & totalHits & entityLabel', () => {
    Page(store, {
      stats: [
        {
          label: 'Documents',
          totalResults: 100,
          currentHits: 28,
          entityLabel: 'files',
        },
      ],
    });
    expect(screen.getByText('Documents: 28 / 100 files')).toBeInTheDocument();
  });

  it('should show multiple bread crumbs when multiple stats are passed', () => {
    Page(store, {
      stats: [
        {
          label: 'Wells',
          totalResults: 500,
          currentHits: 28,
        },
        { label: 'Wellbores', totalResults: 430, currentHits: 90 },
      ],
    });
    expect(screen.getByText('Wells: 28 / 500')).toBeInTheDocument();
    expect(screen.getByText('Wellbores: 90 / 430')).toBeInTheDocument();
  });

  it('should show stats info', () => {
    Page(store, {
      stats: [
        {
          label: 'Documents',
          totalResults: 500,
          currentHits: 28,
          info: [
            {
              name: 'File Type',
              content: [
                {
                  name: 'PDF',
                  count: 28,
                },
              ],
            },
          ],
        },
      ],
    });
    fireEvent.click(screen.getByTestId('bread-crumb-info-button'));
    expect(screen.getByText('PDF', { exact: false })).toBeInTheDocument();
  });
});
