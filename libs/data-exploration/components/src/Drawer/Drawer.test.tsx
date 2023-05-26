import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Drawer } from '..';
import { renderComponent } from '../';

describe('Drawer', () => {
  //   const { isOpen, open, close } = useDialog();
  test.skip("shouldn't be visible by default", () => {
    renderComponent(Drawer, {
      visible: false,
      onClose: jest.fn(),
      children: 'Some text',
    });
    expect(screen.queryByText('Some text')).not.toBeInTheDocument();
  });
  test('render the drawer', () => {
    const visible = true;
    const onClose = jest.fn();
    renderComponent(Drawer, {
      visible,
      onClose,
      children: 'Some text',
    });
    expect(screen.getByText(/some text/i)).toBeInTheDocument();
    const button = screen.getByRole('button', {
      name: 'Close button',
    });
    expect(button).toBeInTheDocument();
    userEvent.click(button);
    expect(onClose).toBeCalled();
  });
});
