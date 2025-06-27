import { describe, test, expect, beforeAll } from 'vitest';
import { RootDomainObject } from './RootDomainObject';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { sdkMock } from '#test-utils/fixtures/sdk';
import { type DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';
import { DomainObject } from './DomainObject';
import { type TranslationInput } from '../utilities/TranslateInput';
import { Changes } from '../domainObjectsHelpers/Changes';

describe(RootDomainObject.name, () => {
  let renderTarget: RevealRenderTarget;
  beforeAll(() => {
    renderTarget = createRenderTargetMock();
  });

  test('should have following default values', () => {
    const domainObject = new RootDomainObject(renderTarget, sdkMock);
    expect(domainObject.renderTarget).toBe(renderTarget);
    expect(domainObject.sdk).toBe(sdkMock);
    expect(domainObject.fdmSdk).toBeDefined();
    expect(domainObject.typeName).toBeDefined();
    expect(domainObject.icon).toBeDefined();
    expect(domainObject.hasIconColor).toBe(false);
    expect(domainObject.hasIndexOnLabel).toBe(false);
    expect(domainObject.isRoot).toBe(true);
  });

  test('should clone', () => {
    const domainObject = new RootDomainObject(renderTarget, sdkMock);
    expect(domainObject.clone()).instanceOf(RootDomainObject);
    expect(domainObject.clone()).not.toBe(domainObject);
  });

  test('should notify the root when something happens with any descendant', () => {
    const root = new RootDomainObject(renderTarget, sdkMock);

    // We will count how many times the events are called
    let addedCount = 0;
    let selectedCount = 0;
    let deletedCount = 0;

    root.views.addEventListener(myOwnRootEventListener);
    {
      // Add one parent with two ChildDomainObject to the root
      const parent = new ParentDomainObject();
      root.addChildInteractive(parent);
      parent.addChildInteractive(new ChildDomainObject());
      parent.addChildInteractive(new ChildDomainObject());
    }
    // Select one ChildDomainObject
    root.getDescendantByType(ChildDomainObject)?.setSelectedInteractive(true);

    // Remove all ChildDomainObjects
    const domainObjects = Array.from(root.getDescendantsByType(ChildDomainObject));
    expect(domainObjects).toHaveLength(2);
    for (const domainObject of domainObjects) {
      domainObject.removeInteractive();
    }
    // Check wether the events were called
    expect(addedCount).toBe(2);
    expect(selectedCount).toBe(1);
    expect(deletedCount).toBe(2);

    function myOwnRootEventListener(domainObject: DomainObject, change: DomainObjectChange): void {
      // Count events on ChildDomainObject only
      if (!(domainObject instanceof ChildDomainObject)) {
        return;
      }
      if (change.isChanged(Changes.added)) {
        addedCount++;
      }
      if (change.isChanged(Changes.selected)) {
        selectedCount++;
      }
      if (change.isChanged(Changes.deleted)) {
        deletedCount++;
      }
    }
  });
});

class ParentDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Parent' };
  }
}
class ChildDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Child' };
  }
}
