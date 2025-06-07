import { beforeEach, describe, expect, test } from 'vitest';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';
import { SliceDomainObject } from '../SliceDomainObject';
import { lastElement } from '../../../base/utilities/extensions/arrayExtensions';
import { ShowAllClippingCommand } from './ShowAllClippingCommand';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';

describe(ShowAllClippingCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let command: ShowAllClippingCommand;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    const root = renderTarget.rootDomainObject;
    command = new ShowAllClippingCommand();
    command.attach(renderTarget);

    // Add some planes and set the last one selected
    for (const domainObject of createClippingDomainObjects()) {
      root.addChild(domainObject);
    }
    const last = lastElement(root.children);
    last?.setSelectedInteractive(true);
  });

  test('Should have default behavior when active tool is not ClipTool', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).not.toBe('');
    expect(command.isVisible).toBe(true);
    expect(command.isEnabled).toBe(true);
    expect(command.isChecked).toBe(false);
  });

  test('Should be not be enable enabled when active tool is ClipTool and more than 1 planes along the axis', () => {
    expect(command.isChecked).toBe(false);
    command.invoke();
    expect(command.isChecked).toBe(true);

    for (const domainObject of getClippingDomainObjects(renderTarget)) {
      if (!domainObject.isSelected) {
        expect(domainObject.isVisible()).toBe(true);
      }
    }

    command.invoke();
    expect(command.isChecked).toBe(false);
    for (const domainObject of getClippingDomainObjects(renderTarget)) {
      if (!domainObject.isSelected) {
        expect(domainObject.isVisible()).toBe(false);
      }
    }
  });
});

function* createClippingDomainObjects(): Generator<DomainObject> {
  yield new SliceDomainObject(PrimitiveType.PlaneX);
  yield new SliceDomainObject(PrimitiveType.PlaneY);
  yield new SliceDomainObject(PrimitiveType.PlaneZ);
  yield new SliceDomainObject(PrimitiveType.PlaneXY);
  yield new CropBoxDomainObject();
}

function* getClippingDomainObjects(renderTarget: RevealRenderTarget): Generator<DomainObject> {
  const root = renderTarget.rootDomainObject;
  for (const domainObject of root.getDescendantsByType(CropBoxDomainObject)) {
    yield domainObject;
  }
  for (const domainObject of root.getDescendantsByType(SliceDomainObject)) {
    yield domainObject;
  }
}
