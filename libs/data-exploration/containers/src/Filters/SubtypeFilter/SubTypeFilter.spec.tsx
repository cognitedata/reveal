import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SubTypeFilter } from './SubTypeFilter';

describe('SubTypeFilter', () => {
  describe('Base', () => {
    test('Expect Empty option ', () => {
      render(<SubTypeFilter options={[]} />);

      expect(screen.getByText(/sub type/gi)).toBeInTheDocument();

      userEvent.click(screen.getByText('Select...'));

      expect(screen.getByText('No options')).toBeInTheDocument();
    });
  });
});
