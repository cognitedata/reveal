/*!
 * Copyright 2025 Cognite AS
 */
import { render, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';
import { createCadHandlerMock } from '../../../../../tests/tests-utilities/fixtures/modelHandler';
import { SelectPanel } from '@cognite/cogs-lab';
import { type ModelHandler } from '../ModelHandler';

describe(WholeLayerVisibilitySelectItem.name, () => {
  let mockCadHandler: ModelHandler;

  beforeEach(() => {
    vi.resetAllMocks();
    mockCadHandler = createCadHandlerMock();
  });

  test('calls update callback when clicked', () => {
    const updateMock = vi.fn();
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <WholeLayerVisibilitySelectItem
              label="CAD Models"
              modelLayerHandlers={[mockCadHandler]}
              update={updateMock}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    );

    const element = getAllByText((content, _element) => content.includes('CAD Models'))[0];
    fireEvent.click(element);
    expect(updateMock).toHaveBeenCalled();
  });

  test('toggles visibility of model handlers when clicked', () => {
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <WholeLayerVisibilitySelectItem
              label="CAD Models"
              modelLayerHandlers={[mockCadHandler]}
              update={vi.fn()}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    );

    const element = getAllByText((content, _element) => content.includes('CAD Models'))[0];
    mockCadHandler.setVisibility(true);
    expect(mockCadHandler.visible()).toBe(true);

    fireEvent.click(element);
    mockCadHandler.setVisibility(false);
    expect(mockCadHandler.visible()).toBe(false);

    fireEvent.click(element);
    mockCadHandler.setVisibility(true);
    expect(mockCadHandler.visible()).toBe(true);
  });

  test('disables item when disabled prop is true', () => {
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <WholeLayerVisibilitySelectItem
              label="CAD Models"
              modelLayerHandlers={[mockCadHandler]}
              update={vi.fn()}
              disabled={true}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    );

    const element = getAllByText((content, _element) => content.includes('CAD Models'))[0];
    expect(element).toBeDefined();
  });
});
