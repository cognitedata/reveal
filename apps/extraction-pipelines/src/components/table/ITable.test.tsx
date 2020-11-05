import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import ITable from './ITable';
import { mockResponse } from '../../utils/mockResponse';
import { getIntegrationTableCol } from './IntegrationTableCol';
import { renderWithSelectedIntegrationContext } from '../../utils/test/render';

describe('<ITable/>', () => {
  const cols = getIntegrationTableCol();
  const mockIntegration = mockResponse[0];
  test('Render without errors', () => {
    renderWithSelectedIntegrationContext(
      <ITable data={mockResponse} columns={cols} />,
      { initIntegration: mockIntegration }
    );
    const colsWithHeaders = cols.filter((col) => col.Header);
    colsWithHeaders.forEach(({ Header }) => {
      const header = screen.getByText(Header);
      expect(header).toBeInTheDocument();
    });
  });

  test('render and interact with row selection', () => {
    renderWithSelectedIntegrationContext(
      <ITable data={mockResponse} columns={cols} />,
      { initIntegration: mockIntegration }
    );
    const sapLabel = screen.getByLabelText(mockResponse[1].name);
    fireEvent.click(sapLabel);
    expect((sapLabel as HTMLInputElement).checked).toEqual(true);
    const azureLabel = screen.getByLabelText(mockResponse[0].name);
    fireEvent.click(azureLabel);
    expect((azureLabel as HTMLInputElement).checked).toEqual(true);
    expect((sapLabel as HTMLInputElement).checked).toEqual(false);
  });

  test('render and interact with sort on header: Name', () => {
    renderWithSelectedIntegrationContext(
      <ITable data={mockResponse} columns={cols} />,
      { initIntegration: mockIntegration }
    );
    const nameHeader = screen.getByText(/name/i);
    const body = screen.getAllByRole('row');
    const firsRowContent = body[1].textContent;
    expect(firsRowContent).toContain('Azure Integration');
    fireEvent.click(nameHeader); // to filter acending
    fireEvent.click(nameHeader); // to filter decending
    const body2 = screen.getAllByRole('row');
    const firstRowContentAfterClick = body2[1].textContent;
    expect(firstRowContentAfterClick).not.toContain('Azure Integration');
    expect(firsRowContent).not.toEqual(firstRowContentAfterClick);
  });

  test('render and interact with filter', async () => {
    renderWithSelectedIntegrationContext(
      <ITable data={mockResponse} columns={cols} />,
      { initIntegration: mockIntegration }
    );
    const searchInput = screen.getByPlaceholderText(/records/i);

    // should filter the sap integration
    fireEvent.change(searchInput, { target: { value: 'sap' } });
    await waitFor(() => {
      const resultRows = screen.getAllByRole('row');
      expect(resultRows.length).toEqual(2);
      // row[0] is the header
      expect(resultRows[1].textContent?.toLowerCase().includes('sap')).toEqual(
        true
      );
    });

    // clear search should show all rows
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      const resultRows = screen.getAllByRole('row');
      expect(resultRows.length).toEqual(5);
    });

    // should filter based name column
    const searchString = 'birger';
    fireEvent.change(searchInput, { target: { value: searchString } });
    await waitFor(() => {
      const resultRows = screen.getAllByRole('row');
      expect(resultRows.length).toEqual(2);
      // row[0] is the header
      expect(
        resultRows[1].textContent?.toLowerCase().includes(searchString)
      ).toEqual(true);
    });

    // should filter from created by col
    const searchJacek = 'jacek';
    fireEvent.change(searchInput, { target: { value: searchJacek } });
    await waitFor(() => {
      const resultRows = screen.getAllByRole('row');
      expect(resultRows.length).toEqual(4);
      // row[0] is the header
      // created by displays only initials but the the search looks in the name of the users.
      expect(resultRows[1].textContent?.toLowerCase().includes('j')).toEqual(
        true
      );
    });
  });
});
