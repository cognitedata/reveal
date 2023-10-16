import { fireEvent, screen, within } from '@testing-library/react';

import { renderComponent } from '@data-exploration-lib/core';

import { ResourceDetailsHeader } from './ResourceDetailsHeader';

describe('ResourceDetailsHeader', () => {
  test('renders title', () => {
    renderComponent(ResourceDetailsHeader, {
      title: 'My Title',
    });
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  test('renders icon', () => {
    renderComponent(ResourceDetailsHeader, {
      icon: 'Alarm',
      title: 'My Title',
    });
    expect(
      within(screen.getByTestId('cogs-chip')).getByLabelText('Alarm')
    ).toBeInTheDocument();
  });

  test('calls onSelectClicked when select button is clicked', () => {
    const onSelectClicked = jest.fn();
    renderComponent(ResourceDetailsHeader, {
      title: 'My Title',
      showSelectButton: true,
      onSelectClicked,
    });
    fireEvent.click(screen.getByTestId('select-button'));
    expect(onSelectClicked).toHaveBeenCalled();
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    renderComponent(ResourceDetailsHeader, {
      title: 'My Title',
      onClose,
    });
    fireEvent.click(screen.getByTestId('close-button'));
    expect(onClose).toHaveBeenCalled();
  });

  test('renders selected state when isSelected is true', () => {
    renderComponent(ResourceDetailsHeader, {
      title: 'My Title',
      isSelected: true,
      showSelectButton: true,
    });
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  test('renders unselected state when isSelected is false', () => {
    renderComponent(ResourceDetailsHeader, {
      title: 'My Title',
      isSelected: false,
      showSelectButton: true,
    });
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  test('renders TitleRowWrapper with correct styles', () => {
    renderComponent(ResourceDetailsHeader, {
      title: 'My Title',
    });
    expect(screen.getByTestId('title-row-wrapper')).toHaveStyle(`
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 8px;
    `);
  });
});
