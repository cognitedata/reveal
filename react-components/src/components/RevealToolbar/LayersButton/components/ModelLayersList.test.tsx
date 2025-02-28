/*!
 * Copyright 2025 Cognite AS
 */
import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ModelLayersList } from './ModelLayersList';
import { createCadHandlerMock } from '../../../../../tests/tests-utilities/fixtures/modelHandler';
import { SelectPanel } from '@cognite/cogs-lab';

describe(ModelLayersList.name, () => {
  test('renders without crashing', () => {
    const mockCadHandler = createCadHandlerMock();
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayersList
              modelLayerHandlers={[mockCadHandler]}
              label="CAD Models"
              update={vi.fn()}
              disabled={false}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    );

    const element = getAllByText((content, _element) => content.includes('CAD Models'))[0];
    expect(element).toBeDefined();
  });
});
