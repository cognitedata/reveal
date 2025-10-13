import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'vitest';
import { ModelLayerSelection } from './ModelLayerSelection';
import { SelectPanel } from '@cognite/cogs-lab';
import { CadDomainObject, RevealRenderTarget } from '../../../../architecture';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { createCadMock } from '#test-utils/fixtures/cadModel';

describe(ModelLayerSelection.name, () => {
  let renderTarget: RevealRenderTarget;
  let cadObject: CadDomainObject;

  beforeEach(() => {
    cadObject = new CadDomainObject(createCadMock());
    renderTarget = createRenderTargetMock();
  });

  test('calls update callback when triggered', async () => {
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayerSelection
              label="CAD Models"
              domainObjects={[cadObject]}
              renderTarget={renderTarget}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    );

    expect(cadObject.isVisible(renderTarget)).toBe(false);
    const element = getAllByText((content, _element) => content.includes('CAD Models'))[0];
    await userEvent.click(element);
    expect(cadObject.isVisible(renderTarget)).toBe(true);
  });

  test('renders without crashing', () => {
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayerSelection
              label="CAD Models"
              domainObjects={[cadObject]}
              renderTarget={renderTarget}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    );

    const element = getAllByText((content, _element) => content.includes('CAD Models'))[0];
    expect(element).toBeDefined();
  });

  test('handles case where no models are provided', () => {
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <ModelLayerSelection
              label="CAD Models"
              domainObjects={[]}
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
