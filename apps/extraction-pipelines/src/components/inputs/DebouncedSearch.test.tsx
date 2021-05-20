import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from 'utils/test';
import { DebouncedSearch } from 'components/inputs/DebouncedSearch';

describe('DebouncedSearch', () => {
  test('Interact with search', async () => {
    const handleChange = jest.fn();
    render(<DebouncedSearch handleChange={handleChange} label="Search" />);
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'test' },
    });
    expect(handleChange).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith('test');
    });
  });
});
