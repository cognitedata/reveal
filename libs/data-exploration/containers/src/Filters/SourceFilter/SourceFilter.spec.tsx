import { SourceFilter } from './SourceFilter';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('SourceFilter', () => {
  describe('Base', () => {
    test('Expect N/A to be in the list', () => {
      render(<SourceFilter options={[]} />);

      userEvent.click(screen.getByText('Select...'));

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    test.todo('Check if the onChange is triggered correctly');
  });
});
