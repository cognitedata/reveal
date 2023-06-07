import { render, screen } from '@testing-library/react';

import { IsStepFilter } from './IsStepFilter';

describe('IsStepFilter', () => {
  describe('Base', () => {
    test('Show  all as selected option', () => {
      render(<IsStepFilter />);
      expect(screen.getByText(/is step/gi)).toBeInTheDocument();
      const allButton = screen.getByTestId('unset');
      expect(allButton.getAttribute('aria-selected')).toBe('true');
    });
  });
});
