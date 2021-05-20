import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import { StatusMenu } from 'components/menu/StatusMenu';
import { Status } from 'model/Status';

describe('StatusMenu', () => {
  test('Renders', () => {
    const setSelected = jest.fn();
    render(<StatusMenu setSelected={setSelected} />);
    const menuBtn = screen.getByText(/status/i);
    expect(menuBtn).toBeInTheDocument();
    fireEvent.click(menuBtn);
    expect(screen.getByText(Status.OK)).toBeInTheDocument();
    const failFilter = screen.getByText(Status.FAIL);
    expect(failFilter).toBeInTheDocument();
    expect(screen.getByText('ALL')).toBeInTheDocument();
    fireEvent.click(failFilter);
    expect(setSelected).toHaveBeenCalledTimes(1);
    expect(setSelected).toHaveBeenCalledWith(Status.FAIL);
  });
});
