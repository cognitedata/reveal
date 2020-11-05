import { screen } from '@testing-library/react';
import React from 'react';
import OverviewTab from './OverviewTab';
import { render } from '../../utils/test';

describe('OverviewTab', () => {
  test('Render with out fail', () => {
    render(<OverviewTab />);
    const sidePanelHeading = screen.getByRole('table');
    expect(sidePanelHeading).toBeInTheDocument();
  });
});
