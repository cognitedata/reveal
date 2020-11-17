import React from 'react';
import { screen } from '@testing-library/react';
import OverviewSidePanel from './OverviewSidePanel';
import { renderWithSelectedIntegrationContext } from '../../utils/test/render';
import { getMockResponse } from '../../utils/mockResponse';

describe('OverviewSidePanel', () => {
  test('Render nothing when integration is not set', () => {
    renderWithSelectedIntegrationContext(<OverviewSidePanel />, {});
    const heading = screen.queryByRole('heading');
    expect(heading).not.toBeInTheDocument();
  });

  test('Render heading when integration is selected', () => {
    const mockIntegration = getMockResponse()[0];
    renderWithSelectedIntegrationContext(<OverviewSidePanel />, {
      initIntegration: mockIntegration,
    });
    const heading = screen.queryByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toEqual(mockIntegration.name);
  });
});
