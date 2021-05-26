import React from 'react';
import { render } from 'utils/test';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithRunFilterContext } from 'utils/test/render';
import { StatusFilterMenu } from 'components/table/StatusFilterMenu';
import { RunStatus } from 'utils/runsUtils';
import { Status } from 'model/Status';

describe('StatusFilterMenu', () => {
  test('Render default', () => {
    render(<StatusFilterMenu />);
    expect(screen.getByText(/status - all/i)).toBeInTheDocument();
  });

  test('Shows value from provider', () => {
    const status = RunStatus.SUCCESS;
    renderWithRunFilterContext(<StatusFilterMenu />, {
      providerProps: { status },
    });
    const statusFilterBtn = screen.getByText(Status.OK);
    expect(statusFilterBtn).toBeInTheDocument();
    fireEvent.click(statusFilterBtn);
    // menu
    expect(screen.getByText(Status.FAIL)).toBeInTheDocument();
    expect(screen.getAllByText(Status.OK).length).toEqual(2); // menu item + text on menu button
    expect(screen.getByText('ALL')).toBeInTheDocument();
  });

  test('Interact with input', () => {
    const status = RunStatus.SUCCESS;
    renderWithRunFilterContext(<StatusFilterMenu />, {
      providerProps: { status },
    });
    const statusFilterBtn = screen.getByText(Status.OK);
    expect(statusFilterBtn).toBeInTheDocument();
    fireEvent.click(statusFilterBtn);
    // menu
    const failFilterItem = screen.getByText(Status.FAIL);
    fireEvent.click(failFilterItem);
    expect(screen.getAllByText(Status.FAIL).length).toEqual(2); // menu item + text on menu button
  });
});
