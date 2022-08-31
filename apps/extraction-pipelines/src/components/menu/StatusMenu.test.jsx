import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import { StatusMenu } from 'components/menu/StatusMenu';
import { RunStatusUI } from 'model/Status';

describe('StatusMenu', () => {
  test.skip('Renders', () => {
    const setSelected = jest.fn();
    render(<StatusMenu setSelected={setSelected} />);
    const menuBtn = screen.getByTestId('status-menu-button');
    expect(menuBtn).toBeInTheDocument();
    fireEvent.click(menuBtn);
    expect(screen.getByText(RunStatusUI.SUCCESS)).toBeInTheDocument();
    const failFilter = screen.getByText(RunStatusUI.FAILURE);
    expect(failFilter).toBeInTheDocument();
    expect(screen.getByText('ALL')).toBeInTheDocument();
    fireEvent.click(failFilter);
    expect(setSelected).toHaveBeenCalledTimes(1);
    expect(setSelected).toHaveBeenCalledWith(RunStatusUI.FAILURE);
  });
});
