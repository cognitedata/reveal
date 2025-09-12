import { beforeEach, describe, expect, test } from 'vitest';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';
import type { CogniteCadModel } from '@cognite/reveal';
import { createCadMock } from '#test-utils/fixtures/cadModel';
import { CadDomainObject } from './CadDomainObject';
import type { RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { viewerModelsMock } from '#test-utils/fixtures/viewer';
import { Box3, Vector3 } from 'three';

describe(CadDomainObject.name, () => {
  let model: CogniteCadModel;
  let domainObject: CadDomainObject;
  let renderTarget: RevealRenderTarget;

  beforeEach(() => {
    model = createCadMock({ visible: false });
    domainObject = new CadDomainObject(model);
    renderTarget = createFullRenderTargetMock();
    renderTarget.root.addChild(domainObject);
  });

  test('has expected default values', () => {
    expect(domainObject.model).toBe(model);
    expect(domainObject.typeName).toEqual({ untranslated: 'CAD' });
    expect(domainObject.icon).toEqual('Cubes');
    expect(domainObject.hasIconColor).toEqual(false);
  });

  test('should be removed', () => {
    viewerModelsMock.mockReturnValue([model]);
    domainObject.removeInteractive();
    expect(renderTarget.viewer.removeModel).toHaveBeenCalledWith(model);
  });

  test('should be set visible', () => {
    expect(domainObject.isVisible()).toBe(false);
    expect(model.visible).toBe(false);
    expect(renderTarget.viewer.requestRedraw).not.toHaveBeenCalled();

    domainObject.setVisibleInteractive(true);

    expect(domainObject.isVisible()).toBe(true);
    expect(model.visible).toBe(true);
    expect(renderTarget.viewer.requestRedraw).toHaveBeenCalled();
  });

  test('should have bounding box', () => {
    const expectedBoundingBox = new Box3(new Vector3(1, 2, 3), new Vector3(4, 5, 6));
    domainObject.model.getModelBoundingBox = () => expectedBoundingBox;
    const actualBoundingBox = domainObject.getBoundingBox();
    expect(actualBoundingBox).toStrictEqual(actualBoundingBox);
  });
});
