import { screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { DataContent, Props } from '../DataContent';

describe('Data content', () => {
  const testInit = (viewProps?: Props) =>
    testRendererModal(DataContent, undefined, viewProps);

  it('should render data content', () => {
    testInit({ header: 'Test Header', data: 'Test data' });

    expect(screen.getByText('Test Header')).toBeInTheDocument();
    expect(screen.getByText('Test data')).toBeInTheDocument();
  });
});
