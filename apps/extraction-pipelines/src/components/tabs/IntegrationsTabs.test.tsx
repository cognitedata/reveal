import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import IntegrationsTabs from './IntegrationsTabs';

describe('IntegrationsTabs', () => {
  test('Render tabs with out fail', () => {
    render(<IntegrationsTabs />);
    const integrationsTab = screen.getByText('Overview');
    expect(integrationsTab).toBeInTheDocument();

    const learningAndResourcesTab = screen.getByText('Learning and resources');
    expect(learningAndResourcesTab).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toEqual(2);
  });
});
