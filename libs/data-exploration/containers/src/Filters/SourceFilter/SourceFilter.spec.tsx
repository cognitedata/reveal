import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SourceFilter } from './SourceFilter';

describe('SourceFilter', () => {
  describe('Base', () => {
    test('Expect N/A to be in the list', () => {
      render(<SourceFilter options={[]} />);

      expect(screen.getByText(/source/gi)).toBeInTheDocument();
      userEvent.click(screen.getByText('Select...'));

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    test.todo('Check if the onChange is triggered correctly');
  });
});
