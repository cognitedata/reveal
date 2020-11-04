import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from 'utils/test';
import ITable from './ITable';
import { mockResponse } from '../../utils/mockResponse';
import { getIntegrationTableCol } from './IntegrationTableCol';

describe('<ITable/>', () => {
  const cols = getIntegrationTableCol();
  test('Render without errors', () => {
    render(<ITable data={mockResponse} columns={cols} />);
    const colsWithHeaders = cols.filter((col) => col.Header);
    colsWithHeaders.forEach(({ Header }) => {
      const header = screen.getByText(Header);
      expect(header).toBeInTheDocument();
    });
  });

  test('render and interact with row selection', () => {
    render(<ITable data={mockResponse} columns={cols} />);
    const sapLabel = screen.getByLabelText(mockResponse[1].name);
    fireEvent.click(sapLabel);
    expect((sapLabel as HTMLInputElement).checked).toEqual(true);
    const azureLabel = screen.getByLabelText(mockResponse[0].name);
    fireEvent.click(azureLabel);
    expect((azureLabel as HTMLInputElement).checked).toEqual(true);
    expect((sapLabel as HTMLInputElement).checked).toEqual(false);
  });

  test('render and interact with sort on header: Name', () => {
    render(<ITable data={mockResponse} columns={cols} />);
    const nameHeader = screen.getByText(/name/i);
    const body = screen.getAllByRole('row');
    const firsRowContent = body[1].textContent;
    expect(firsRowContent).toContain('Azure Integration');
    fireEvent.click(nameHeader);
    const body2 = screen.getAllByRole('row');
    const firstRowContentAfterClick = body2[1].textContent;
    expect(firstRowContentAfterClick).not.toContain('Azure Integration');
    expect(firsRowContent).not.toEqual(firstRowContentAfterClick);
  });
});
