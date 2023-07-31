import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { FilterTitle } from '../FilterTitle';

describe('FilterTitle', () => {
  const page = (viewProps?: any) =>
    testRenderer(FilterTitle, undefined, viewProps);

  const defaultTestInit = async () => {
    return { ...page({ title: 'test-title' }) };
  };

  it('should render filter title correctly', async () => {
    await defaultTestInit();
    expect(screen.getByText('test-title')).toBeInTheDocument();
  });
});
