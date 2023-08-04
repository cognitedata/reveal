import { fireEvent, screen } from '@testing-library/react';

import { Button } from '@cognite/cogs.js';

import { renderComponent } from '@data-exploration-lib/core';

import { BulkActionBar } from '..';

describe('BulkActionBar', () => {
  test("shouldn't render the component if the visible props is false", () => {
    renderComponent(BulkActionBar, {
      isVisible: false,
      title: 'Title',
    });
    expect(screen.queryByText('Title')).not.toBeVisible();
  });
  test('renders titles', () => {
    renderComponent(BulkActionBar, {
      isVisible: true,
      title: 'Header',
      subtitle: 'Subheader',
    });
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Subheader')).toBeInTheDocument();
  });
  test('render the children', () => {
    renderComponent(BulkActionBar, {
      isVisible: true,
      title: 'Header',
      children: (
        <Button data-testid="add-icon-button" icon="Add">
          Add to Collection
        </Button>
      ),
    });
    const button = screen.getByRole('button', { name: /add to collection/i });
    expect(button).toBeVisible();
  });
  test('show the options and menu', () => {
    const options = [
      { type: 'asset', name: 'Norway' },
      { type: 'event', name: 'Material' },
    ];
    renderComponent(BulkActionBar, {
      isVisible: true,
      title: 'Header',
      options,
    });
    expect(screen.getByText('Header')).toBeInTheDocument();
    const button = screen.getByLabelText('Dropdown');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    const menuHeader = screen.getByText('Selected');
    expect(menuHeader).toBeInTheDocument();
    expect(screen.getByText(options[0].name)).toBeInTheDocument();

    expect(screen.getByText(/asset/i)).toBeInTheDocument();
  });
});
