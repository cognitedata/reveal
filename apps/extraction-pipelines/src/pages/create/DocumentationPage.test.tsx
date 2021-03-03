import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import DocumentationPage, {
  DESCRIPTION_LABEL,
  INTEGRATION_DOCUMENTATION_HEADING,
} from './DocumentationPage';

describe('DescriptionPage', () => {
  beforeEach(() => {
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      `create/integration-description`
    );
    render(<DocumentationPage />, { wrapper });
  });
  test('Renders', () => {
    expect(
      screen.getByText(INTEGRATION_DOCUMENTATION_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(DESCRIPTION_LABEL)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const nameInput = screen.getByLabelText(DESCRIPTION_LABEL);
    const description = 'Im entering a description for the integration';
    fireEvent.change(nameInput, { target: { value: description } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(description)).toBeInTheDocument();
    });
  });
});
