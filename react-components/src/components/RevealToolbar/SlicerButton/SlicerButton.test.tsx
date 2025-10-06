import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type ReactElement, type ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { SlicerButton } from './SlicerButton';
import { SlicerButtonContext, defaultSlicerButtonDependencies } from './SlicerButton.context';
import { getMocksByDefaultDependencies } from '#test-utils/vitest-extensions/getMocksByDefaultDependencies';
import { Mock } from 'moq.ts';
import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';
import { type I18nContent } from '../../i18n/types';

describe(SlicerButton.name, () => {
  const deps = getMocksByDefaultDependencies(defaultSlicerButtonDependencies);

  const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
    <SlicerButtonContext.Provider value={deps}>{children}</SlicerButtonContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();

    const mockViewer = new Mock<Cognite3DViewer<DataSourceType>>()
      .setup((viewer) => viewer.setGlobalClippingPlanes)
      .returns(vi.fn())
      .setup((viewer) => viewer.canvas)
      .returns(document.createElement('canvas'))
      .setup((viewer) => viewer.domElement)
      .returns(document.createElement('div'))
      .setup((viewer) => viewer.models)
      .returns([])
      .setup((viewer) => viewer.dispose)
      .returns(vi.fn())
      .setup((viewer) => viewer.fitCameraToModel)
      .returns(vi.fn())
      .setup((viewer) => viewer.addModel)
      .returns(vi.fn())
      .setup((viewer) => viewer.removeModel)
      .returns(vi.fn())
      .object();

    deps.useReveal.mockReturnValue(mockViewer);

    deps.use3dModels.mockReturnValue([]);

    const mockTranslation: I18nContent = {
      t: (translationInput) =>
        typeof translationInput === 'object' ? String(translationInput) : translationInput,
      currentLanguage: 'en'
    };

    deps.useTranslation.mockReturnValue(mockTranslation);
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
