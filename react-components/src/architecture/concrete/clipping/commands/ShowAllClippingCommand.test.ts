import { beforeEach, describe, expect, test } from 'vitest';
import { createFullRenderTargetMock } from '../../../../../tests/tests-utilities/fixtures/createFullRenderTargetMock';
import { CropBoxDomainObject } from '../CropBoxDomainObject';
import { isEmpty } from '../../../base/utilities/TranslateInput';
import { lastElement } from '../../../base/utilities/extensions/arrayExtensions';
import { PlanePrimitiveTypes } from '../../../base/utilities/primitives/PrimitiveType';
import { ShowAllClippingCommand } from './ShowAllClippingCommand';
import { SliceDomainObject } from '../SliceDomainObject';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { type RevealRenderTarget } from '../../../base/renderTarget/RevealRenderTarget';

describe(ShowAllClippingCommand.name, () => {
  let renderTarget: RevealRenderTarget;
  let command: ShowAllClippingCommand;

  beforeEach(() => {
    renderTarget = createFullRenderTargetMock();
    command = new ShowAllClippingCommand();
    command.attach(renderTarget);

    // Add some planes and set the last one selected
    const root = renderTarget.rootDomainObject;
    for (const domainObject of createClippingDomainObjects()) {
      root.addChild(domainObject);
    }
    const last = lastElement(root.children);
    last?.setSelectedInteractive(true);
  });

  test('Should have icon, tooltip and enabled', () => {
    expect(isEmpty(command.tooltip)).toBe(false);
    expect(command.icon).not.toBe('');
    expect(command.isEnabled).toBe(true);
  });

  test('Should set all clipping domain objects visible and then invisible', () => {
    expect(command.isChecked).toBe(false);
    expect(isAllVisible(false, renderTarget)).toBe(true);

    command.invoke(); // Make all visible
    expect(command.isChecked).toBe(true);
    expect(isAllVisible(true, renderTarget)).toBe(true);

    command.invoke(); // Make all invisible
    expect(command.isChecked).toBe(false);
    expect(isAllVisible(false, renderTarget)).toBe(true);
  });
});

function isAllVisible(isVisible: boolean, renderTarget: RevealRenderTarget): boolean {
  for (const domainObject of getClippingDomainObjects(renderTarget)) {
    if (domainObject.isSelected) {
      continue;
    }
    if (domainObject.isVisible(renderTarget) !== isVisible) {
      return false;
    }
  }
  return true;

  function* getClippingDomainObjects(renderTarget: RevealRenderTarget): Generator<DomainObject> {
    const root = renderTarget.rootDomainObject;
    for (const domainObject of root.getDescendantsByType(CropBoxDomainObject)) {
      yield domainObject;
    }
    for (const domainObject of root.getDescendantsByType(SliceDomainObject)) {
      yield domainObject;
    }
  }
}

function* createClippingDomainObjects(): Generator<DomainObject> {
  for (const primitiveType of PlanePrimitiveTypes) {
    yield new SliceDomainObject(primitiveType);
  }
  yield new CropBoxDomainObject();
}
