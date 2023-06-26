import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DataSetFilter } from './DataSetFilter';

describe('DataSetFilter', () => {
  describe('Base', () => {
    test('Show no options in the list', () => {
      render(<DataSetFilter options={[]} />);

      expect(screen.getByTestId('filter-label')).toBeInTheDocument();
      expect(screen.getByText(/data set/i)).toBeInTheDocument();

      // eslint-disable-next-line testing-library/no-unnecessary-act
      act(() => {
        userEvent.click(screen.getByText('Select...'));
      });

      expect(screen.getByText('No options')).toBeInTheDocument();
    });
  });
});
