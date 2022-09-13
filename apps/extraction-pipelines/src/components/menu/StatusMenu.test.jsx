import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import { StatusMenu } from 'components/menu/StatusMenu';

describe('StatusMenu', () => {
  test.skip('Renders', () => {
    const setSelected = jest.fn();
    render(<StatusMenu setSelected={setSelected} />);
    const menuBtn = screen.getByTestId('status-menu-button');
    expect(menuBtn).toBeInTheDocument();
    fireEvent.click(menuBtn);
    expect(screen.getByText('Success')).toBeInTheDocument();
    const failFilter = screen.getByText('Failure');
    expect(failFilter).toBeInTheDocument();
    expect(screen.getByText('ALL')).toBeInTheDocument();
    fireEvent.click(failFilter);
    expect(setSelected).toHaveBeenCalledTimes(1);
    expect(setSelected).toHaveBeenCalledWith('Failure');
  });
});
