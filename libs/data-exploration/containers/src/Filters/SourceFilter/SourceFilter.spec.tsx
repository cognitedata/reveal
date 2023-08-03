import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { NOT_SET } from '@data-exploration-lib/core';

import { SourceFilter } from './SourceFilter';

describe('SourceFilter', () => {
  describe('Base', () => {
    test('Expect Not Set to be in the list', () => {
      render(<SourceFilter options={[]} />);

      expect(screen.getByText(/source/gi)).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-unnecessary-act
      act(() => {
        userEvent.click(screen.getByText('Select...'));
      });
      expect(screen.getByText(NOT_SET)).toBeInTheDocument();
    });

    test.todo('Check if the onChange is triggered correctly');
  });
});
