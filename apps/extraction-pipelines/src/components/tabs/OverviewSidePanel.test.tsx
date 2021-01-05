import React from 'react';
import { screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import OverviewSidePanel from './OverviewSidePanel';
import { renderWithSelectedIntegrationContext } from '../../utils/test/render';
import { getMockResponse } from '../../utils/mockResponse';

describe('OverviewSidePanel', () => {
  test('Render nothing when integration is not set', () => {
    renderWithSelectedIntegrationContext(<OverviewSidePanel />, {
      initIntegration: undefined,
      client: new QueryClient(),
    });
    const heading = screen.queryByRole('heading');
    expect(heading).not.toBeInTheDocument();

    const strongMessage = screen.getByText('Please select an integration');
    expect(strongMessage).toBeInTheDocument();

    const firstParagraph = screen.getByText(
      'In the sidepanel you will see basic monitoring and and contact information to persons connected to the integration.'
    );
    expect(firstParagraph).toBeInTheDocument();
  });

  test('Render heading when integration is selected', () => {
    const mockIntegration = getMockResponse()[0];
    renderWithSelectedIntegrationContext(<OverviewSidePanel />, {
      initIntegration: mockIntegration,
      client: new QueryClient(),
    });
    const heading = screen.queryByRole('heading');
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toEqual(mockIntegration.name);
  });

  test('Render tabs with out fail', () => {
    const mockIntegration = getMockResponse()[0];
    renderWithSelectedIntegrationContext(<OverviewSidePanel />, {
      initIntegration: mockIntegration,
      client: new QueryClient(),
    });
    const monitoringTab = screen.getByText('Monitoring');
    expect(monitoringTab).toBeInTheDocument();

    const contactInformationTab = screen.getByText('Contact information');
    expect(contactInformationTab).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toEqual(2);
  });
});
