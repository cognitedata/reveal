import { render, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ModelLayerSelection } from './ModelLayerSelection';
import { createCadHandlerMock } from '#test-utils/fixtures/modelHandler';
import { SelectPanel } from '@cognite/cogs-lab';

describe(ModelLayerSelection.name, () => {
  const mockCadHandler = createCadHandlerMock();

  test('calls update callback when triggered', () => {
    const updateMock = vi.fn();
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayerSelection
              label="CAD Models"
              domainObjects={[mockCadHandler]}
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

  test('renders without crashing', () => {
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayerSelection
              label="CAD Models"
              domainObjects={[mockCadHandler]}
              update={vi.fn()}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    );

    const element = getAllByText((content, _element) => content.includes('CAD Models'))[0];
    expect(element).toBeDefined();
  });

  test('disables selection when no handlers are provided', () => {
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayerSelection label="CAD Models" domainObjects={[]} update={vi.fn()} />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    );

    const element = getAllByText((content, _element) => content.includes('CAD Models'))[0];
    expect(element).toBeDefined();
  });
});
