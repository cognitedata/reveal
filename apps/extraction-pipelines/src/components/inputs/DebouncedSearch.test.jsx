import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { render } from 'utils/test';
import { DebouncedSearch } from 'components/inputs/DebouncedSearch';
import { renderWithRunFilterContext } from 'utils/test/render';

describe('DebouncedSearch', () => {
  test('Render default', async () => {
    render(<DebouncedSearch label="Search" placeholder="Search" />);
    const searchField = screen.getByLabelText('Search');
    expect(searchField).toBeInTheDocument();
    expect(searchField.textContent).toEqual('');
  });
  test('Render stored value', async () => {
    const search = 'the search';
    renderWithRunFilterContext(
      <DebouncedSearch label="Search" placeholder="Search" />,
      { providerProps: { search } }
    );
    const searchField = screen.getByLabelText('Search');
    expect(searchField).toBeInTheDocument();
    expect(screen.getByDisplayValue(search)).toBeInTheDocument();
  });

  test('Interact with search', async () => {
    renderWithRunFilterContext(
      <DebouncedSearch label="Search" placeholder="Search" />,
      {}
    );
    const searchField = screen.getByLabelText('Search');
    expect(searchField).toBeInTheDocument();
    expect(searchField.textContent).toEqual('');
    const newSearchValue = 'test';
    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: newSearchValue },
    });
    expect(screen.getByDisplayValue(newSearchValue)).toBeInTheDocument();
  });
});
