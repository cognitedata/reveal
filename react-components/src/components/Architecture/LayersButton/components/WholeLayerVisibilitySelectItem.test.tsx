import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import userEvent from '@testing-library/user-event';
import { WholeLayerVisibilitySelectItem } from './WholeLayerVisibilitySelectItem';
import { SelectPanel } from '@cognite/cogs-lab';
import { CadDomainObject, type RevealRenderTarget } from '../../../../architecture';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { createCadMock } from '#test-utils/fixtures/cadModel';

describe(WholeLayerVisibilitySelectItem.name, () => {
  let cadObject: CadDomainObject;
  let renderTarget: RevealRenderTarget;

  beforeEach(() => {
    cadObject = new CadDomainObject(createCadMock());
    renderTarget = createRenderTargetMock();
  });

  test('toggles visibility of model when clicked', async () => {
    cadObject.setVisibleInteractive(true, renderTarget);
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <WholeLayerVisibilitySelectItem
              label="CAD Models"
              domainObjects={[cadObject]}
              renderTarget={renderTarget}
            />
          </SelectPanel.Section>
        </SelectPanel.Body>
      </SelectPanel>
    );

    const element = getAllByText((content, _element) => content.includes('CAD Models'))[0];

    await userEvent.click(element);
    expect(cadObject.isVisible(renderTarget)).toBe(false);
  });

  test('disables item when no domain objects were provided', () => {
    const { getAllByText } = render(
      <SelectPanel visible={true}>
        <SelectPanel.Body>
          <SelectPanel.Section>
            <WholeLayerVisibilitySelectItem
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
