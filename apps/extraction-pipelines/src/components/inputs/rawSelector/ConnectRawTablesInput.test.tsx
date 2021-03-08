import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithReactHookForm } from '../../../utils/test/render';
import ConnectRawTablesInput, {
  CONNECT_RAW_TABLES_HINT,
} from './ConnectRawTablesInput';
import { DBS_LABEL, TABLES_LABEL } from './RawSelector';
import { databaseListMock } from '../../../utils/mockResponse';
import { useRawDBAndTables } from '../../../hooks/useRawDBAndTables';

jest.mock('../../../hooks/useRawDBAndTables', () => {
  return {
    useRawDBAndTables: jest.fn(),
  };
});
describe('ConnectRawTablesPage', () => {
  const mockData = databaseListMock;

  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Renders', () => {
    useRawDBAndTables.mockReturnValue({ isLoading: false, data: mockData });
    renderWithReactHookForm(<ConnectRawTablesInput />, {
      defaultValues: { selectedRawTables: [] },
    });
    expect(screen.getByText(CONNECT_RAW_TABLES_HINT)).toBeInTheDocument();
    expect(screen.getByText(DBS_LABEL)).toBeInTheDocument();
    expect(screen.getByText(TABLES_LABEL)).toBeInTheDocument();
  });
});
