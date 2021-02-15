import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import ConnectRawTablesPage, {
  DB_NAME_LABEL,
  INTEGRATION_CONNECT_RAW_TABLES_HEADING,
  TABLE_NAME_LABEL,
} from './ConnectRawTablesPage';

describe('ConnectRawTablesPage', () => {
  beforeEach(() => {
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      `create/integration-contacts`
    );
    render(<ConnectRawTablesPage />, { wrapper });
  });
  test('Renders', () => {
    expect(
      screen.getByText(INTEGRATION_CONNECT_RAW_TABLES_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(DB_NAME_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(TABLE_NAME_LABEL)).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const nameInput = screen.getByLabelText(DB_NAME_LABEL);
    const nameString = 'myDataBase';
    fireEvent.change(nameInput, { target: { value: nameString } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(nameString)).toBeInTheDocument();
    });
    const emailInput = screen.getByLabelText(TABLE_NAME_LABEL);
    const emailString = 'my_table_name';
    fireEvent.change(emailInput, { target: { value: emailString } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(emailString)).toBeInTheDocument();
    });
  });
});
