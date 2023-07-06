import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AssetSelectFilter } from './AssetSelectFilter';

describe('AssetSelectFilter', () => {
  describe('Base', () => {
    test('Show no options in the list', () => {
      render(<AssetSelectFilter options={[]} />);

      expect(screen.getByTestId('filter-label')).toBeInTheDocument();
      expect(screen.getByText(/asset/i)).toBeInTheDocument();

      // eslint-disable-next-line testing-library/no-unnecessary-act
      act(() => {
        userEvent.click(screen.getByText('Select...'));
      });

      expect(screen.getByText('No options')).toBeInTheDocument();
    });
  });
});
