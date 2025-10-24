import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { HelpButton } from './HelpButton';
import { HelpButtonContext, defaultHelpButtonDependencies } from './HelpButton.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { type I18nContent } from '../../i18n/types';

describe(HelpButton.name, () => {
  const deps = getMocksByDefaultDependencies(defaultHelpButtonDependencies);

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <HelpButtonContext.Provider value={deps}>{children}</HelpButtonContext.Provider>
  );

  const defaultProps = {
    fallbackLanguage: 'en',
    placement: 'right' as const
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const mockTranslation: I18nContent = {
      t: (translationInput) => {
        if (typeof translationInput === 'object' && 'key' in translationInput) {
          return translationInput.key;
        }
        if (typeof translationInput === 'object' && 'untranslated' in translationInput) {
          return translationInput.untranslated;
        }
        return String(translationInput);
      },
      currentLanguage: 'en'
    };

    deps.useTranslation.mockReturnValue(mockTranslation);

    deps.MouseNavigation.mockReturnValue(<div>Mouse Navigation</div>);
    deps.TouchNavigation.mockReturnValue(<div>Touch Navigation</div>);
    deps.KeyboardNavigation.mockReturnValue(<div>Keyboard Navigation</div>);
  });

  test('renders without crashing', () => {
    render(<HelpButton {...defaultProps} />, { wrapper });

    const button = screen.getByRole('button', { name: 'help-button' });
    expect(button.className.includes('cogs-button')).toBe(true);
  });

  test('toggles HelpButton on click and shows toggled class, toggles off on second click', async () => {
    render(<HelpButton {...defaultProps} />, { wrapper });

    const button = screen.getByRole('button', { name: 'help-button' });

    expect(button).not.toHaveClass('cogs-button--toggled');

    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');

    await userEvent.click(button);
    expect(button).not.toHaveClass('cogs-button--toggled');
  });
});
