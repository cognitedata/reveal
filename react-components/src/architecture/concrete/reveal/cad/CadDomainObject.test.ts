import { describe, expect, test } from 'vitest';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { CogniteCadModel } from '@cognite/reveal';
import { createCadMock } from '../../../../../tests/tests-utilities/fixtures/cadModel';
import { CadRenderStyle } from './CadRenderStyle';
import { CadDomainObject } from './CadDomainObject';

describe(CogniteCadModel.name, () => {
  test('has expected default values', () => {
    const model = createCadMock({ visible: false });
    const domainObject = new CadDomainObject(model);

    expect(domainObject.model).toBe(model);
    expect(domainObject.typeName).toEqual({ untranslated: 'CAD' });
    expect(domainObject.icon).toEqual('Cubes');
    expect(domainObject.hasIconColor).toEqual(false);
    expect(domainObject.createRenderStyle()).toBeInstanceOf(CadRenderStyle);
  });

  test('should be removed', async () => {
    const model = createCadMock({ visible: false });
    const domainObject = new CadDomainObject(model);

    const renderTarget = createFullRenderTargetMock();
    renderTarget.rootDomainObject.addChild(domainObject);
    domainObject.removeInteractive();
    expect(renderTarget.viewer.removeModel).toHaveBeenCalledWith(model);
  });

  test('should be set visible', async () => {
    const model = createCadMock({ visible: false });
    const domainObject = new CadDomainObject(model);
    const renderTarget = createFullRenderTargetMock();
    renderTarget.rootDomainObject.addChild(domainObject);

    expect(domainObject.isVisible()).toBe(false);
    expect(model.visible).toBe(false);

    domainObject.setVisibleInteractive(true);

    expect(domainObject.isVisible()).toBe(true);
    expect(model.visible).toBe(true);
  });
});
