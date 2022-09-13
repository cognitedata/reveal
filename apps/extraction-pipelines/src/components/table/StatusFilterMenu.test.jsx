import React from 'react';
import { render } from 'utils/test';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithRunFilterContext } from 'utils/test/render';
import { StatusFilterMenu } from 'components/table/StatusFilterMenu';

describe('StatusFilterMenu', () => {
  test('Render default', () => {
    render(<StatusFilterMenu />);
    expect(screen.getByTestId('status-menu-button')).toBeInTheDocument();
  });

  test.skip('Shows value from provider', () => {
    const statuses = ['success'];
    renderWithRunFilterContext(<StatusFilterMenu />, {
      providerProps: { statuses },
    });
    const statusesFilterBtn = screen.getByText('Success');
    expect(statusesFilterBtn).toBeInTheDocument();
    fireEvent.click(statusesFilterBtn);
    // menu
    expect(screen.getByText(RunStatusUI.FAILURE)).toBeInTheDocument();
    expect(screen.getAllByText('Success').length).toEqual(2); // menu item + text on menu button
    expect(screen.getByText('ALL')).toBeInTheDocument();
  });

  test.skip('Interact with input', () => {
    const statuses = ['success'];
    renderWithRunFilterContext(<StatusFilterMenu />, {
      providerProps: { statuses },
    });
    const statusesFilterBtn = screen.getByText('Success');
    expect(statusesFilterBtn).toBeInTheDocument();
    fireEvent.click(statusesFilterBtn);
    // menu
    const failFilterItem = screen.getByText(RunStatusUI.FAILURE);
    fireEvent.click(failFilterItem);
    expect(screen.getAllByText(RunStatusUI.FAILURE).length).toEqual(2); // menu item + text on menu button
  });
});
