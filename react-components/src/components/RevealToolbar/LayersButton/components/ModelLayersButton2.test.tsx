import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, expect, test, beforeEach } from 'vitest';
import { ModelLayersButton } from './ModelLayersButton2';
import { CadDomainObject, type RevealRenderTarget } from '../../../../architecture';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { createCadMock } from '#test-utils/fixtures/cadModel';

describe(ModelLayersButton.name, () => {
  let renderTarget: RevealRenderTarget;

  beforeEach(() => {
    renderTarget = createRenderTargetMock();
  });

  test('renders without crashing', () => {
    render(
      <ModelLayersButton
        icon="CubeIcon"
        label="CAD Models"
        domainObjects={[]}
        renderTarget={renderTarget}
      />
    );

    expect(screen.getAllByRole('button')[0]).toBeDefined();
  });

  test('toggles visibility of models when clicked', async () => {
    const cadObject = new CadDomainObject(createCadMock());
    render(
      <ModelLayersButton
        icon="CubeIcon"
        label="CAD Models"
        domainObjects={[cadObject]}
        renderTarget={renderTarget}
      />
    );

    const button = screen.getAllByRole('button');

    // Open panel
    await userEvent.click(button[0]);

    // Find checkboxes (all models checkbox + single model checkbox)
    const checkbox = screen.getAllByRole('menuitemcheckbox');

    expect(checkbox).toHaveLength(2);
    expect(cadObject.isVisible(renderTarget)).toBe(false);

    await userEvent.click(checkbox[0]);
    expect(cadObject.isVisible(renderTarget)).toBe(true);

    await userEvent.click(checkbox[1]);
    expect(cadObject.isVisible(renderTarget)).toBe(false);
  });
});
