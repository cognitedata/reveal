import { render, screen } from '@testing-library/react';
import { IsStringFilter } from './IsStringFilter';

describe('IsStringFilter', () => {
  describe('Base', () => {
    test('Show all selected', () => {
      render(<IsStringFilter />);
      expect(screen.getByText(/is string/gi)).toBeInTheDocument();
      const allButton = screen.getByTestId('unset');
      expect(allButton.getAttribute('aria-selected')).toBe('true');
    });
  });
});
