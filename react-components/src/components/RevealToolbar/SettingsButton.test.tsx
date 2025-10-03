import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { SettingsButton } from './SettingsButton';

vi.mock('../i18n/I18n', () => ({
  useTranslation: () => ({
    t: ({ key }: { key: string }) => key
  })
}));

vi.mock('./SettingsContainer/HighFidelityContainer', () => ({
  HighFidelityContainer: () => <div>High Fidelity Container</div>
}));

describe(SettingsButton.name, () => {
  const defaultProps = {
    customSettingsContent: <div>Custom Settings</div>,
    lowQualitySettings: {},
    highQualitySettings: {}
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<SettingsButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Show settings' });
    expect(button.className.includes('cogs-button')).toBe(true);
  });

  test('toggles SettingsButton on click and shows toggled class', async () => {
    render(<SettingsButton {...defaultProps} />);

    const button = screen.getByRole('button', { name: 'Show settings' });

    expect(button).not.toHaveClass('cogs-button--toggled');

    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');
  });
});
