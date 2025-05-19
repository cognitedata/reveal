/*!
 * Copyright 2025 Cognite AS
 */

import assert from 'assert';
import { describe, expect, test } from 'vitest';
import { CropBoxDomainObject } from './CropBoxDomainObject';
import { isEmpty } from '../../base/utilities/TranslateInput';
import { SolidPrimitiveRenderStyle } from '../primitives/common/SolidPrimitiveRenderStyle';
import { Box3, Plane, Vector3 } from 'three';
import { setClippingPlanes } from './commands/setClippingPlanes';
import { isViewerMock } from '#test-utils//fixtures/viewer';
import { createFullRenderTargetMock } from '#test-utils/fixtures/createFullRenderTargetMock';

import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';

describe(CropBoxDomainObject.name, () => {
  test('Should be initialized', () => {
    const domainObject = createSmallCropBox();

    expect(domainObject.icon?.length).greaterThan(0);
    expect(isEmpty(domainObject.typeName)).toBe(false);
    expect(domainObject.useClippingInIntersection).toBe(false);
    expect(domainObject.hasBoldLabel).toBe(false);
    expect(domainObject.createRenderStyle()).instanceOf(SolidPrimitiveRenderStyle);
  });

  test('Should be cloned', () => {
    const domainObject = createSmallCropBox();
    const clone = domainObject.clone();

    expect(clone).toBeInstanceOf(CropBoxDomainObject);
    expect(clone).not.toBe(domainObject);
    if (!(clone instanceof CropBoxDomainObject)) {
      return;
    }
    expect(clone.box).toStrictEqual(domainObject.box);
    expect(clone.color).toStrictEqual(domainObject.color);
    expect(clone.uniqueId).toBe(domainObject.uniqueId);
    expect(clone.name).toBe(domainObject.name);
    expect(clone.renderStyle).toStrictEqual(domainObject.renderStyle);
  });

  test('Should set and reset global clipping planes', () => {
    const renderTarget = createFullRenderTargetMock();
    const domainObject = createSmallCropBox();
    renderTarget.rootDomainObject.addChild(domainObject);

    setLargeSceneBoundingBox(renderTarget);

    // Set the crop box as global clipping planes
    expect(renderTarget.isGlobalCropBox(domainObject)).toBe(false);
    domainObject.setThisAsGlobalCropBox();
    expect(renderTarget.isGlobalCropBox(domainObject)).toBe(true);
    expect(domainObject.hasBoldLabel).toBe(true);
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(6);

    // Reset global clipping planes
    setClippingPlanes(renderTarget.rootDomainObject);
    expect(renderTarget.isGlobalCropBox(domainObject)).toBe(false);
    expect(domainObject.hasBoldLabel).toBe(false);
    expect(renderTarget.getGlobalClippingPlanes().length).toBe(0);
  });

  test('Should set and reset global clipping planes by selection', () => {
    const renderTarget = createFullRenderTargetMock();
    const domainObject = createSmallCropBox();
    renderTarget.rootDomainObject.addChild(domainObject);

    setLargeSceneBoundingBox(renderTarget);
    renderTarget.viewer.setGlobalClippingPlanes([new Plane()]); // Must have at least one plane

    // Set the crop box as global clipping planes
    expect(renderTarget.isGlobalCropBox(domainObject)).toBe(false);
    domainObject.setSelectedInteractive(true);
    expect(renderTarget.isGlobalCropBox(domainObject)).toBe(true);

    // Reset global clipping planes by removing
    domainObject.setSelectedInteractive(false);
    expect(renderTarget.isGlobalCropBox(domainObject)).toBe(false);
  });

  test('Should reset global clipping planes by remove', () => {
    const renderTarget = createFullRenderTargetMock();
    const domainObject = createSmallCropBox();
    renderTarget.rootDomainObject.addChild(domainObject);

    setLargeSceneBoundingBox(renderTarget);

    // Set the crop box as global clipping planes
    domainObject.setThisAsGlobalCropBox();
    expect(renderTarget.isGlobalCropBox(domainObject)).toBe(true);

    // Reset global clipping planes by removing
    domainObject.removeInteractive(false);
    expect(renderTarget.isGlobalCropBox(domainObject)).toBe(false);
  });
});

function createSmallCropBox(): CropBoxDomainObject {
  // Make a small crop box
  const domainObject = new CropBoxDomainObject();
  domainObject.box.size.set(1, 1, 1);
  return domainObject;
}

function setLargeSceneBoundingBox(renderTarget: RevealRenderTarget): void {
  const { viewer } = renderTarget;
  assert(isViewerMock(viewer));
  const boundingBox = new Box3(new Vector3(), new Vector3()).expandByScalar(100);
  viewer.setSceneBoundingBox(boundingBox);
}
