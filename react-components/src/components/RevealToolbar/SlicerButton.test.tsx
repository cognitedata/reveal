import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { SlicerButton } from './SlicerButton';

vi.mock('../RevealCanvas/ViewerContext', () => ({
  useReveal: () => ({
    setGlobalClippingPlanes: vi.fn()
  })
}));

vi.mock('../../hooks/use3dModels', () => ({
  use3dModels: () => []
}));

vi.mock('../i18n/I18n', () => ({
  useTranslation: () => ({
    t: ({ key }: { key: string }) => key
  })
}));

describe(SlicerButton.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<SlicerButton />);

    const button = screen.getByRole('button', { name: 'Slice models' });
    expect(button.className.includes('cogs-button')).toBe(true);
  });

  test('toggles SlicerButton on click and shows toggled class', async () => {
    render(<SlicerButton />);

    const button = screen.getByRole('button', { name: 'Slice models' });

    expect(button).not.toHaveClass('cogs-button--toggled');

    await userEvent.click(button);
    expect(button).toHaveClass('cogs-button--toggled');
  });
});
