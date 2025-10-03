import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { SlicerButton } from './SlicerButton';
import { SlicerButtonContext, defaultSlicerButtonDependencies } from './SlicerButton.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';

describe(SlicerButton.name, () => {
  const slicerButtonDependencies = getMocksByDefaultDependencies(defaultSlicerButtonDependencies);

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <SlicerButtonContext.Provider value={slicerButtonDependencies}>
      {children}
    </SlicerButtonContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    slicerButtonDependencies.useReveal.mockImplementation(
      () =>
        ({
          setGlobalClippingPlanes: vi.fn()
        }) as any
    );

    slicerButtonDependencies.use3dModels.mockReturnValue([]);

    slicerButtonDependencies.useTranslation.mockReturnValue({
      t: (translationInput: any) =>
        typeof translationInput === 'object' ? translationInput.key : translationInput,
      currentLanguage: 'en',
      fallbackLanguage: 'en'
    } as any);
  });

  test('renders without crashing', () => {
    render(<SlicerButton />, { wrapper });

    const button = screen.getByRole('button', { name: 'Slice models' });
    expect(button.className.includes('cogs-button')).toBe(true);
  });

  test('toggles SlicerButton on click and shows toggled class', async () => {
    render(<SlicerButton />, { wrapper });

    const button = screen.getByRole('button', { name: 'Slice models' });

    expect(button).not.toHaveClass('cogs-button--toggled');

    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');
  });

  test('SlicerButton is no longer toggled when clicked outside of button and modal', async () => {
    render(
      <div>
        <SlicerButton />
        <button data-testid="outside-button">Outside</button>
      </div>,
      { wrapper }
    );

    const slicerButton = screen.getByRole('button', { name: 'Slice models' });
    const outsideButton = screen.getByTestId('outside-button');

    // Open slicer menu
    await userEvent.click(slicerButton);
    expect(slicerButton).toHaveClass('cogs-button--toggled');

    // Click outside
    await userEvent.click(outsideButton);

    // Slicer button should not be toggled anymore
    expect(slicerButton).not.toHaveClass('cogs-button--toggled');
  });
});
