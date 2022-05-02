import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { LoadingSpinner } from '../LoadingSpinner';

describe('LoadingSpinner', () => {
  const defaultTestInit = async (props?: any) => ({
    ...testRenderer(LoadingSpinner, undefined, props),
  });

  it('should not render loading spinner on default', async () => {
    await defaultTestInit();
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
  });

  it('should render loading spinner as expected', async () => {
    await defaultTestInit({ isLoading: true });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
