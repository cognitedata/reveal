import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { SettingsButton } from './SettingsButton';
import { SettingsButtonContext, defaultSettingsButtonDependencies } from './SettingsButton.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(SettingsButton.name, () => {
  const defaultProps = {
    customSettingsContent: <div>Custom Settings</div>,
    lowQualitySettings: {},
    highQualitySettings: {}
  };

  const settingsButtonDependencies = getMocksByDefaultDependencies(
    defaultSettingsButtonDependencies
  );

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <SettingsButtonContext.Provider value={settingsButtonDependencies}>
      {children}
    </SettingsButtonContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    settingsButtonDependencies.useTranslation.mockReturnValue({
      t: (translationInput: any) =>
        typeof translationInput === 'object' ? translationInput.key : translationInput,
      currentLanguage: 'en',
      fallbackLanguage: 'en'
    } as any);

    settingsButtonDependencies.HighFidelityContainer.mockReturnValue(
      <div>High Fidelity Container</div>
    );
  });

  test('renders without crashing', () => {
    render(<SettingsButton {...defaultProps} />, { wrapper });

    const button = screen.getByRole('button', { name: 'Show settings' });
    expect(button.className.includes('cogs-button')).toBe(true);
  });

  test('toggles SettingsButton on click and shows toggled class', async () => {
    render(<SettingsButton {...defaultProps} />, { wrapper });

    const button = screen.getByRole('button', { name: 'Show settings' });

    expect(button).not.toHaveClass('cogs-button--toggled');

    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');
  });

  test('clicking outside the button and modal toggles the button off', async () => {
    render(
      <div>
        <SettingsButton {...defaultProps} />
        <div data-testid="outside">Outside Element</div>
      </div>,
      { wrapper }
    );

    const button = screen.getByRole('button', { name: 'Show settings' });

    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');

    await userEvent.click(screen.getByTestId('outside'));

    expect(button).not.toHaveClass('cogs-button--toggled');
  });
});
