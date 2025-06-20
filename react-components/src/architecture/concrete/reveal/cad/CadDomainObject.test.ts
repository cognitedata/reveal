import { beforeEach, describe, expect, test } from 'vitest';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { CogniteCadModel } from '@cognite/reveal';
import { createCadMock } from '../../../../../tests/tests-utilities/fixtures/cadModel';
import { CadRenderStyle } from './CadRenderStyle';
import { CadDomainObject } from './CadDomainObject';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';

describe(CogniteCadModel.name, () => {
  let model: CogniteCadModel;
  let domainObject: CadDomainObject;
  let renderTarget: RevealRenderTarget;

  beforeEach(() => {
    model = createCadMock({ visible: false });
    domainObject = new CadDomainObject(model);
    renderTarget = createFullRenderTargetMock();
    renderTarget.rootDomainObject.addChild(domainObject);
  });

  test('has expected default values', () => {
    expect(domainObject.model).toBe(model);
    expect(domainObject.typeName).toEqual({ untranslated: 'CAD' });
    expect(domainObject.icon).toEqual('Cubes');
    expect(domainObject.hasIconColor).toEqual(false);
    expect(domainObject.createRenderStyle()).toBeInstanceOf(CadRenderStyle);
  });

  test('should be removed', async () => {
    domainObject.removeInteractive();
    expect(renderTarget.viewer.removeModel).toHaveBeenCalledWith(model);
  });

  test('should be set visible', async () => {
    expect(domainObject.isVisible()).toBe(false);
    expect(model.visible).toBe(false);
    expect(renderTarget.viewer.requestRedraw).not.toHaveBeenCalled();

    domainObject.setVisibleInteractive(true);

    expect(domainObject.isVisible()).toBe(true);
    expect(model.visible).toBe(true);
    expect(renderTarget.viewer.requestRedraw).toHaveBeenCalled();
  });
});
