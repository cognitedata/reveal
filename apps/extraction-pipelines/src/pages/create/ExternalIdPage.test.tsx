import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { NEXT } from '../../utils/constants';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import ExternalIdPage, {
  EXTERNAL_ID_REQUIRED,
  INTEGRATION_EXTERNAL_ID_HEADING,
} from './ExternalIdPage';

describe('ExternalIdPage', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      `create/integration-external-id`
    );
    render(<ExternalIdPage />, { wrapper });
  });
  test('Renders', () => {
    expect(
      screen.getByText(INTEGRATION_EXTERNAL_ID_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByLabelText('External id')).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const nameInput = screen.getByLabelText('External id');
    const nextBtn = screen.getByText(NEXT);
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.getByText(EXTERNAL_ID_REQUIRED)).toBeInTheDocument();
    });
    const externalId = 'some_external_id';
    fireEvent.change(nameInput, { target: { value: externalId } });
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.queryByText(EXTERNAL_ID_REQUIRED)).not.toBeInTheDocument();
    });
  });
});
