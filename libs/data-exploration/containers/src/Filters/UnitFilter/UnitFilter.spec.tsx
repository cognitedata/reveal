import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UnitFilter } from './UnitFilter';

describe('UnitFilter', () => {
  describe('Base', () => {
    test('Show no options in the list', () => {
      render(<UnitFilter options={[]} />);
      expect(screen.getByText(/unit/gi)).toBeInTheDocument();

      userEvent.click(screen.getByText('Select...'));

      expect(screen.getByText('No options')).toBeInTheDocument();
    });
  });
});
