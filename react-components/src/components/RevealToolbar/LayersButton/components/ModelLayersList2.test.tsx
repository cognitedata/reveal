import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { ModelLayersList } from './ModelLayersList2';
import { SelectPanel } from '@cognite/cogs-lab';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { CadDomainObject } from '../../../../architecture';
import { createCadMock } from '#test-utils/fixtures/cadModel';

describe(ModelLayersList.name, () => {
  test('renders without crashing', () => {
    const renderTarget = createRenderTargetMock();
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayersList
              domainObjects={[new CadDomainObject(createCadMock())]}
              label="CAD Models"
              renderTarget={renderTarget}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    );

    const element = getAllByText((content, _element) => content.includes('CAD Models'))[0];
    expect(element).toBeDefined();
  });
});
