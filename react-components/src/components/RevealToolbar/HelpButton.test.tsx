import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { HelpButton } from './HelpButton';

vi.mock('../i18n/I18n', () => ({
  useTranslation: () => ({
    t: ({ key }: { key: string }) => key
  })
}));

vi.mock('./Help/MouseNavigation', () => ({
  MouseNavigation: () => <div>Mouse Navigation</div>
}));

vi.mock('./Help/TouchNavigation', () => ({
  TouchNavigation: () => <div>Touch Navigation</div>
}));

vi.mock('./Help/KeyboardNavigation', () => ({
  KeyboardNavigation: () => <div>Keyboard Navigation</div>
}));

describe(HelpButton.name, () => {
  const defaultProps = {
    fallbackLanguage: 'en',
    placement: 'right' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<HelpButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'help-button' });
    expect(button.className.includes('cogs-button')).toBe(true);
  });

  test('toggles HelpButton on click and shows toggled class', async () => {
    render(<HelpButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'help-button' });

    expect(button).not.toHaveClass('cogs-button--toggled');

    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');
  });
});
