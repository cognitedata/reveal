/*!
 * Copyright 2024 Cognite AS
 */

import { describe, test, beforeAll, expect } from 'vitest';
import { VisualDomainObject } from './VisualDomainObject';
import { type TranslationInput } from '../utilities/TranslateInput';
import { installThreeView } from '../views/ThreeViewFactory';
import { ThreeView } from '../views/ThreeView';
import { Box3 } from 'three';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { VisibleState } from '../domainObjectsHelpers/VisibleState';
import { FocusType } from '../domainObjectsHelpers/FocusType';
import { EventChangeTester } from '#test-utils/architecture/EventChangeTester';
import { Changes } from '../domainObjectsHelpers/Changes';
import { FolderDomainObject } from './FolderDomainObject';
import { type DomainObject } from './DomainObject';
import { type DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';

describe(VisualDomainObject.name, () => {
  let renderTarget: RevealRenderTarget;
  beforeAll(() => {
    renderTarget = createRenderTargetMock();
  });

  test('should have following default behavior', () => {
    const domainObject = new MyDomainObject();
    expect(domainObject.isLegal).toBe(true);
    expect(domainObject.useClippingInIntersection).toBe(true);
    expect(domainObject.getEditToolCursor(renderTarget)).toBeUndefined();
  });

  test('should set focus type to Pending', () => {
    const domainObject = new MyDomainObject();
    expect(domainObject.focusType).toBe(FocusType.None);
    const focusTester = new EventChangeTester(domainObject, Changes.focus);
    domainObject.setFocusInteractive(FocusType.Pending);
    expect(domainObject.focusType).toBe(FocusType.Pending);
    focusTester.toHaveBeenCalledOnce();
  });

  test('should set focus type from Pending to Body', () => {
    const domainObject = new MyDomainObject();
    domainObject.setFocusInteractive(FocusType.Pending);
    expect(domainObject.focusType).toBe(FocusType.Pending);

    const focusTester = new EventChangeTester(domainObject, Changes.focus);
    const geometryTester = new EventChangeTester(domainObject, Changes.geometry);
    domainObject.setFocusInteractive(FocusType.Body);
    expect(domainObject.focusType).toBe(FocusType.Body);
    focusTester.toHaveBeenCalledOnce();
    geometryTester.toHaveBeenCalledOnce();
  });
});

describe('VisualDomainObject when no view installed', () => {
  let renderTarget: RevealRenderTarget;
  beforeAll(() => {
    renderTarget = createRenderTargetMock();
  });

  test('should not be visible', () => {
    const domainObject = new MyDomainObject();
    shouldBeDisabledVisible(domainObject, renderTarget);
  });

  test('should be visible', () => {
    const domainObject = new MyDomainObject();
    domainObject.setVisibleInteractive(true, renderTarget);
    shouldBeDisabledVisible(domainObject, renderTarget);
  });
});

describe('VisualDomainObject with view installed', () => {
  let renderTarget: RevealRenderTarget;
  beforeAll(() => {
    installThreeView(MyDomainObject, MyThreeView);
    renderTarget = createRenderTargetMock();
  });

  test('should not be visible', () => {
    const domainObject = new MyDomainObject();
    shouldBeNoneVisible(domainObject, renderTarget);
  });

  test('should be visible', () => {
    const domainObject = new MyDomainObject();
    domainObject.setVisibleInteractive(true, renderTarget);
    shouldBeAllVisible(domainObject, renderTarget);
  });

  test('should set visible twice', () => {
    const domainObject = new MyDomainObject();
    domainObject.setVisibleInteractive(true, renderTarget);
    domainObject.setVisibleInteractive(true, renderTarget);
    shouldBeAllVisible(domainObject, renderTarget);
  });

  test('should set not visible twice', () => {
    const domainObject = new MyDomainObject();
    domainObject.setVisibleInteractive(true, renderTarget);
    domainObject.setVisibleInteractive(false, renderTarget);
    domainObject.setVisibleInteractive(false, renderTarget);
    shouldBeNoneVisible(domainObject, renderTarget);
  });

  test('should toggle visible', () => {
    const domainObject = new MyDomainObject();
    domainObject.setVisibleInteractive(true, renderTarget);
    domainObject.toggleVisibleInteractive(renderTarget);
    shouldBeNoneVisible(domainObject, renderTarget);
  });

  test('hierarchy should not be visible', () => {
    const folder = createSmallHierarchy();
    for (const descendant of folder.getThisAndDescendants()) {
      shouldBeNoneVisible(descendant, renderTarget);
    }
  });

  test('hierarchy should set visible state on parent by children', () => {
    const folder = createSmallHierarchy();
    folder.getChild(0).toggleVisibleInteractive(renderTarget);
    shouldBeSomeVisible(folder, renderTarget);
    folder.getChild(1).toggleVisibleInteractive(renderTarget);
    shouldBeAllVisible(folder, renderTarget);
  });

  test('hierarchy should set visible state on children by parent', () => {
    const folder = createSmallHierarchy();
    folder.toggleVisibleInteractive(renderTarget);

    for (const descendant of folder.getThisAndDescendants()) {
      shouldBeAllVisible(descendant, renderTarget);
    }
  });

  test('should update the view', () => {
    const domainObject = new MyDomainObject();
    domainObject.toggleVisibleInteractive(renderTarget);
    const view = domainObject.getViewByTarget(renderTarget);
    expect(view).instanceOf(MyThreeView);
    if (!(view instanceof MyThreeView)) {
      return;
    }
    domainObject.notify(Changes.selected);
    expect(view.geometryChangedTimes).toBe(0);
    domainObject.notify(Changes.geometry);
    expect(view.geometryChangedTimes).toBe(1);
  });
});

function createSmallHierarchy(): DomainObject {
  const folder = new FolderDomainObject();
  const domainObject1 = new MyDomainObject();
  const domainObject2 = new MyDomainObject();
  folder.addChildInteractive(domainObject1);
  folder.addChildInteractive(domainObject2);
  return folder;
}

class MyDomainObject extends VisualDomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'MyDomainObject' };
  }
}

class MyThreeView extends ThreeView {
  public geometryChangedTimes = 0;
  protected override calculateBoundingBox(): Box3 {
    return new Box3();
  }

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.geometry)) {
      this.geometryChangedTimes++;
    }
  }
}

function shouldBeNoneVisible(domainObject: DomainObject, renderTarget: RevealRenderTarget): void {
  expect(domainObject.isVisible(renderTarget)).toBe(false);
  expect(domainObject.getVisibleState(renderTarget)).toBe(VisibleState.None);
  if (domainObject instanceof VisualDomainObject) {
    expect(domainObject.getViewByTarget(renderTarget)).toBeUndefined();
  }
}

function shouldBeDisabledVisible(
  domainObject: DomainObject,
  renderTarget: RevealRenderTarget
): void {
  expect(domainObject.isVisible(renderTarget)).toBe(false);
  expect(domainObject.getVisibleState(renderTarget)).toBe(VisibleState.Disabled);
  if (domainObject instanceof VisualDomainObject) {
    expect(domainObject.getViewByTarget(renderTarget)).toBeUndefined();
  }
}
function shouldBeAllVisible(domainObject: DomainObject, renderTarget: RevealRenderTarget): void {
  expect(domainObject.isVisible(renderTarget)).toBe(true);
  expect(domainObject.getVisibleState(renderTarget)).toBe(VisibleState.All);

  if (domainObject instanceof VisualDomainObject) {
    expect(domainObject.getViewByTarget(renderTarget)).instanceOf(MyThreeView);
  }
}

function shouldBeSomeVisible(domainObject: DomainObject, renderTarget: RevealRenderTarget): void {
  expect(domainObject.isVisible(renderTarget)).toBe(true);
  expect(domainObject.getVisibleState(renderTarget)).toBe(VisibleState.Some);
  expect(domainObject).not.instanceOf(VisualDomainObject);
}
