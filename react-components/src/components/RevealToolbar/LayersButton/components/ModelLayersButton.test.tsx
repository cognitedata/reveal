import { render, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { ModelLayersButton } from './ModelLayersButton';
import { createCadHandlerMock } from '#test-utils/fixtures/modelHandler';
import { type ModelHandler } from '../ModelHandler';

describe(ModelLayersButton.name, () => {
  let mockCadHandler: ModelHandler;

  beforeEach(() => {
    vi.resetAllMocks();
    mockCadHandler = createCadHandlerMock();
  });

  test('renders without crashing', () => {
    const { getAllByRole } = render(
      <ModelLayersButton
        icon="CubeIcon"
        label="CAD Models"
        handlers={[mockCadHandler]}
        update={vi.fn()}
      />
    );

    expect(getAllByRole('button')).toBeTruthy();
  });

  test('toggles visibility of model handlers when clicked', () => {
    const updateMock = vi.fn();
    const { getAllByRole } = render(
      <ModelLayersButton
        icon="CubeIcon"
        label="CAD Models"
        handlers={[mockCadHandler]}
        update={updateMock}
      />
    );

    const button = getAllByRole('button');
    mockCadHandler.setVisibility(true);
    expect(mockCadHandler.visible()).toBe(true);

    fireEvent.click(button[0]);
    mockCadHandler.setVisibility(false);
    expect(mockCadHandler.visible()).toBe(false);

    fireEvent.click(button[0]);
    mockCadHandler.setVisibility(true);
    expect(mockCadHandler.visible()).toBe(true);
  });
});
