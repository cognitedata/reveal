import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import OverviewSidePanel from './OverviewSidePanel';

describe('OverviewSidePanel', () => {
  test('Render with out fail', () => {
    render(<OverviewSidePanel />);
    const heading = screen.getByRole('heading');
    expect(heading).toBeInTheDocument();
  });
});
