import { renderWithSelectedIntegrationContext } from 'utils/test/render';
import {
  CONNECTED_DATA_SET_LABEL,
  DataSetDocumentationContacts,
  DOCUMENTATION_LABEL,
} from 'components/integration/DataSetDocumentationContacts';
import { QueryClient } from 'react-query';
import { getMockResponse } from 'utils/mockResponse';
import React from 'react';
import { screen } from '@testing-library/react';
import { TableHeadings } from 'components/table/IntegrationTableCol';

describe('DataSetDocumentationContacts', () => {
  test('Renders information', () => {
    const mockIntegration = getMockResponse()[0];
    renderWithSelectedIntegrationContext(<DataSetDocumentationContacts />, {
      initIntegration: mockIntegration,
      client: new QueryClient(),
    });
    expect(screen.getByText(mockIntegration.dataSet?.name)).toBeInTheDocument();
    expect(
      screen.getByText(`${mockIntegration.contacts?.length} contacts`)
    ).toBeInTheDocument();
  });

  test('Renders without integration', () => {
    renderWithSelectedIntegrationContext(<DataSetDocumentationContacts />, {
      initIntegration: null,
      client: new QueryClient(),
    });
    expect(screen.getByText(CONNECTED_DATA_SET_LABEL)).toBeInTheDocument();
    expect(screen.getByText(DOCUMENTATION_LABEL)).toBeInTheDocument();
    expect(screen.getByText(TableHeadings.CONTACTS)).toBeInTheDocument();
  });
});
