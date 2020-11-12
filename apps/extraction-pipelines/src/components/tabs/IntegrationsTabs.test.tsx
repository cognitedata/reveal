import React from 'react';
import { render } from 'utils/test';
import { screen } from '@testing-library/react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import IntegrationsTabs from './IntegrationsTabs';
import { mockResponse } from '../../utils/mockResponse';

describe('IntegrationsTabs', () => {
  test('Render tabs with out fail', () => {
    sdkv3.get.mockResolvedValue({ data: { items: mockResponse } });
    render(<IntegrationsTabs />);
    const integrationsTab = screen.getByText('Overview');
    expect(integrationsTab).toBeInTheDocument();

    const learningAndResourcesTab = screen.getByText('Learning and resources');
    expect(learningAndResourcesTab).toBeInTheDocument();

    const extractorDownloadsTab = screen.getByText('Extractor downloads');
    expect(extractorDownloadsTab).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toEqual(3);
  });
});
