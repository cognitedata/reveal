/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslationInput } from '../utilities/TranslateInput';

import { describe, test, expect, beforeAll, vi } from 'vitest';
import { DomainObject } from './DomainObject';
import { Color } from 'three/src/math/Color.js';
import { DomainObjectChange } from '../domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../domainObjectsHelpers/Changes';
import { PopupStyle } from '../domainObjectsHelpers/PopupStyle';
import { RenderStyle } from '../renderStyles/RenderStyle';
import { cloneDeep } from 'lodash';
import { ColorType } from '../domainObjectsHelpers/ColorType';
import { BLACK_COLOR, WHITE_COLOR } from '../utilities/colors/colorExtensions';
import { ChangedDescription } from '../domainObjectsHelpers/ChangedDescription';
import { createRenderTargetMock } from '#test-utils/fixtures/renderTarget';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { DomainObjectPanelUpdater } from '../reactUpdaters/DomainObjectPanelUpdater';

describe('DomainObject', () => {
  test('should have following default behavior', () => {
    const domainObject = new DefaultDomainObject();
    expect(domainObject.icon).toBeUndefined();
    expect(domainObject.isVisibleInTree).toBe(true);
    expect(domainObject.hasBoldLabel).toBe(false);
    expect(domainObject.canChangeName).toBe(true);
    expect(domainObject.hasIndexOnLabel).toBe(true);
    expect(domainObject.labelExtension).toBeUndefined();
    expect(domainObject.canChangeColor).toBe(true);
    expect(domainObject.hasIconColor).toBe(true);
    expect(domainObject.canBeSelected).toBe(true);
    expect(domainObject.canBeRemoved).toBe(true);
    expect(domainObject.isLegal).toBe(true);
    expect(domainObject.isRenderStyleRoot).toBe(false);
    expect(domainObject.createRenderStyle()).toBeUndefined();
    expect(domainObject.getRenderStyle()).toBeUndefined();
    expect(domainObject.createTransaction(Symbol('any'))).toBeUndefined();
    expect(domainObject.canBeActive).toBe(false);
    expect(domainObject.renderStyleRoot).toBeUndefined();
    // expect(domainObject.clone()).toThrow(); TODO: toThrow not work
  });

  test('should have following panel info default values', () => {
    const domainObject = new DefaultDomainObject();
    expect(domainObject.hasPanelInfo).toBe(false);
    expect(domainObject.getPanelInfo()).toBeUndefined();
    expect(domainObject.getPanelInfoStyle()).instanceOf(PopupStyle);
    expect(domainObject.getPanelToolbar().length).toBe(3);
  });

  test('should have different ids', () => {
    const domainObject1 = new ChildDomainObject();
    const domainObject2 = new ChildDomainObject();
    expect(domainObject1.id).not.toBe(domainObject2.id);
  });

  test('should have default label', () => {
    const domainObject1 = new ChildDomainObject();
    expect(domainObject1.label).toBe('Child');

    const domainObject2 = new ChildDomainObject();
    domainObject1.addChild(domainObject2);
    expect(domainObject2.label).toBe('Child 1');
  });

  test('should have label from name', () => {
    const name = 'MyName';
    const domainObject = new ChildDomainObject();
    domainObject.name = name;
    expect(domainObject.name).toBe(name);
    expect(domainObject.label).toBe(name);
  });

  test('should have color', () => {
    const domainObject = new ChildDomainObject();
    const color = domainObject.color;
    const isGreyScale = color.r === color.g && color.r === color.b;
    const rgbSum = color.r + color.g + color.b;
    expect(isGreyScale).toBe(false);
    expect(rgbSum).greaterThan(0);
    expect(rgbSum).lessThan(3);
  });

  test('should set color', () => {
    const domainObject = new ChildDomainObject();
    const color = new Color(1, 0, 1);
    domainObject.color = color;
    expect(domainObject.color).equals(color);
  });

  test('should select', () => {
    const domainObject = new ChildDomainObject();
    domainObject.isSelected = true;
    expect(domainObject.isSelected).toBe(true);
    domainObject.isSelected = false;
    expect(domainObject.isSelected).toBe(false);

    const tester = new EventChangeTester(domainObject, Changes.selected);
    domainObject.setSelectedInteractive(true);
    expect(domainObject.isSelected).toBe(true);
    tester.toHaveBeenCalledOnce();
  });

  test('should activate', () => {
    const domainObject = new ChildDomainObject();
    domainObject.isActive = true;
    expect(domainObject.isActive).toBe(true);
    domainObject.isActive = false;
    expect(domainObject.isActive).toBe(false);

    const tester = new EventChangeTester(domainObject, Changes.active);
    domainObject.setActiveInteractive();
    expect(domainObject.isActive).toBe(true);
    tester.toHaveBeenCalledOnce();
  });

  test('should activate', () => {
    const parent = new ParentDomainObject();
    for (let i = 0; i < 5; i++) {
      parent.addChild(new ChildDomainObject());
    }
    const child1 = parent.getChild(0);
    const child2 = parent.getChild(parent.childCount - 1);

    child1.setActiveInteractive();
    expect(child1.isActive).toBe(true);
    expect(child2.isActive).toBe(false);

    child2.setActiveInteractive();
    expect(child1.isActive).toBe(false);
    expect(child2.isActive).toBe(true);
  });

  test('should expand', () => {
    const domainObject = new ChildDomainObject();
    domainObject.isExpanded = true;
    expect(domainObject.isExpanded).toBe(true);
    domainObject.isExpanded = false;
    expect(domainObject.isExpanded).toBe(false);

    const tester = new EventChangeTester(domainObject, Changes.expanded);
    domainObject.isExpanded = true;
    expect(domainObject.isExpanded).toBe(true);
    tester.toHaveBeenCalledOnce();
  });

  test('should check hierarchy getters', () => {
    const parent = new ParentDomainObject();
    expect(parent.children.length).toBe(0);
    expect(parent.childCount).toBe(0);
    expect(parent.childIndex).toBeUndefined();
    expect(parent.parent).toBeUndefined();
    expect(parent.root).toBe(parent);
    expect(parent.isRoot).toBe(false);
    expect(parent.hasParent).toBe(false);
    expect(parent.isParent).toBe(false);

    parent.addChild(new ChildDomainObject());
    parent.addChild(new ChildDomainObject());
    expect(parent.children.length).toBe(2);
    expect(parent.childCount).toBe(2);
    expect(parent.isParent).toBe(true);

    const root = new ChildDomainObject();
    root.addChild(parent);
    expect(parent.parent).toBe(root);
    expect(parent.root).toBe(root);
    expect(parent.isRoot).toBe(false);
    expect(parent.hasParent).toBe(true);
  });

  test('should check add child', () => {
    const parent = new ParentDomainObject();
    expect(parent.children.length).toBe(0);
    expect(parent.childCount).toBe(0);
    expect(parent.childIndex).toBeUndefined();
    expect(parent.isParent).toBe(false);
    expect(parent.root).toBe(parent);
    expect(parent.isRoot).toBe(false);
    expect(parent.parent).toBeUndefined();
    expect(parent.hasParent).toBe(false);

    parent.addChild(new ChildDomainObject());
    parent.addChild(new ChildDomainObject());
    expect(parent.children.length).toBe(2);
    expect(parent.childCount).toBe(2);
    expect(parent.isParent).toBe(true);

    const root = new RootDomainObject();
    root.addChild(parent);
    expect(parent.childIndex).toBe(0);
    expect(parent.root).toBe(root);
    expect(parent.isRoot).toBe(false);
    expect(parent.parent).toBe(root);
    expect(parent.hasParent).toBe(true);
  });

  test('should add child interactive', () => {
    const parent = new ParentDomainObject();
    const child = new ChildDomainObject();
    const tester1 = new EventChangeTester(parent, Changes.childAdded);
    const tester2 = new EventChangeTester(child, Changes.added);
    parent.addChildInteractive(child);
    tester1.toHaveBeenCalledOnce();
    tester2.toHaveBeenCalledOnce();
  });

  test('should remove interactive', () => {
    const parent = new ParentDomainObject();
    const child = new ChildDomainObject();
    parent.addChildInteractive(child);
    expect(parent.childCount).toBe(1);
    expect(child.parent).toBe(parent);

    const tester1 = new EventChangeTester(parent, Changes.childDeleted);
    const tester2 = new EventChangeTester(child, Changes.deleted);
    child.removeInteractive();
    tester1.toHaveBeenCalledOnce();
    tester2.toHaveBeenCalledOnce();
    expect(parent.childCount).toBe(0);
    expect(child.parent).toBeUndefined();
  });

  test('should test copyFrom', () => {
    const source = new ParentDomainObject();
    source.name = 'MyName';
    expect(source.getRenderStyle()).not.toBeUndefined();

    const destination = new ParentDomainObject();
    destination.copyFrom(source);

    expect(destination.uniqueId).toBe(source.uniqueId);
    expect(destination.color).toBe(source.color);
    expect(destination.name).toBe(source.name);
    expect(destination.getRenderStyle()).toStrictEqual(source.getRenderStyle());
  });

  test('should test treeViewListener', () => {
    const domainObject = new ChildDomainObject();

    const fn = vi.fn();
    domainObject.addTreeNodeListener(fn);
    expect(fn).not.toHaveBeenCalled();
    domainObject.updateTreeNodeListeners();
    expect(fn).toBeCalledTimes(1);
    domainObject.removeTreeNodeListener(fn);
    domainObject.updateTreeNodeListeners();
    expect(fn).toBeCalledTimes(1);
  });

  test('should test addEventListener/removeEventListener', () => {
    const domainObject = new ChildDomainObject();

    const fn = vi.fn();
    const change = Changes.color;
    domainObject.views.addEventListener(fn);
    expect(fn).not.toHaveBeenCalled();
    domainObject.notify(change);
    expect(fn).toBeCalledTimes(1);
    domainObject.views.removeEventListener(fn);
    domainObject.notify(change);
    expect(fn).toBeCalledTimes(1);
  });

  test('should test notify', () => {
    const domainObject = new ChildDomainObject();
    const change = Changes.color;
    for (let i = 0; i < 3; i++) {
      const tester = new EventChangeTester(domainObject, change);
      if (i === 0) {
        domainObject.notify(change);
      } else if (i === 1) {
        domainObject.notify(new ChangedDescription(change));
      } else {
        domainObject.notify(new DomainObjectChange(change));
      }
      tester.toHaveBeenCalledOnce();
    }
  });

  test('should test notify on CommandsUpdater', () => {
    const domainObject = new ChildDomainObject();
    const renderTarget = createRenderTargetMock();
    renderTarget.rootDomainObject.addChild(domainObject);

    expect(CommandsUpdater.needUpdate).toBe(false);
    const change = Changes.selected;
    domainObject.notify(change);
    expect(CommandsUpdater.needUpdate).toBe(true);
  });

  test('should test notify descendants', () => {
    const parent = new ParentDomainObject();
    const child = new ChildDomainObject();
    parent.addChild(child);

    const change = Changes.color;
    for (let i = 0; i < 3; i++) {
      const childTester = new EventChangeTester(child, change);
      if (i === 0) {
        parent.notifyDescendants(change);
      } else if (i === 1) {
        parent.notifyDescendants(new ChangedDescription(change));
      } else {
        parent.notifyDescendants(new DomainObjectChange(change));
      }
      childTester.toHaveBeenCalledOnce();
    }
  });

  test('should notify notify descendants when render style root', () => {
    const parent = new ParentDomainObject();
    const child = new ChildDomainObject();
    parent.addChild(child);

    const change = Changes.renderStyle;
    const childTester = new EventChangeTester(child, change);
    parent.notify(change);
    childTester.toHaveBeenCalledOnce();
  });

  test('should notify notify descendants..... style root', () => {
    const child = new ChildDomainObject();
    child.isSelected = true;
    expect(DomainObjectPanelUpdater.selectedDomainObject()).toBeUndefined();
    child.notify(Changes.selected);

    expect(DomainObjectPanelUpdater.selectedDomainObject()).toBe(child);
    child.isSelected = false;
    child.notify(Changes.selected);
    expect(DomainObjectPanelUpdater.selectedDomainObject()).toBeUndefined();
  });

  test('should get style for the render target root', () => {
    const parent = new ParentDomainObject();
    const child = new ChildDomainObject();
    parent.addChild(child);

    const renderStyle = parent.getRenderStyle();
    expect(renderStyle).toBeDefined();
    expect(child.createRenderStyle()).toBeUndefined();
    expect(parent.createRenderStyle()).toBeDefined();
    expect(child.getRenderStyle()).toBe(renderStyle);
  });

  test('should test supportsColorType/getColorByColorType', () => {
    const parent = new ParentDomainObject();
    const child = new ChildDomainObject();
    parent.addChild(child);

    expect(child.supportsColorType(ColorType.Specified, false)).toBe(true);
    expect(child.getColorByColorType(ColorType.Specified)).toBe(child.color);

    expect(child.supportsColorType(ColorType.Parent, false)).toBe(true);
    expect(child.getColorByColorType(ColorType.Parent)).toBe(parent.color);

    expect(child.supportsColorType(ColorType.Black, false)).toBe(true);
    expect(child.getColorByColorType(ColorType.Black)).toBe(BLACK_COLOR);

    expect(child.supportsColorType(ColorType.White, false)).toBe(true);
    expect(child.getColorByColorType(ColorType.White)).toBe(WHITE_COLOR);

    expect(child.supportsColorType(ColorType.ColorMap, false)).toBe(false);
    expect(child.supportsColorType(ColorType.Different, false)).toBe(false);
  });
});

describe('DomainObject hierarchy', () => {
  let root: DomainObject;

  beforeAll(() => {
    root = createHierarchy();
  });

  test('should test hasChildByType', () => {
    expect(root.hasChildByType(ChildDomainObject)).toBe(false);
    expect(root.hasChildByType(ParentDomainObject)).toBe(true);
  });

  test('should test getChild', () => {
    expect(root.getChild(0)).toBe(root.children[0]);
    expect(root.getChild(1)).toBe(root.children[1]);
  });

  test('should test getChildByType', () => {
    const child = root.getChild(0);
    expect(root.getChildByType(ParentDomainObject)).toBe(child);
  });

  test('should test getActiveChildByType', () => {
    const child = root.getChild(1);
    expect(root.getActiveChildByType(ParentDomainObject)).toBeUndefined();
    child.isActive = true;
    expect(root.getActiveChildByType(ParentDomainObject)).toBe(child);
  });

  test('should test getChildrenByType', () => {
    expect(count(root.getChildrenByType(ParentDomainObject))).toBe(2);
  });

  test('should test getDescendants', () => {
    expect(count(root.getDescendants())).toBe(7);
    expect(first(root.getDescendants())).instanceOf(ParentDomainObject);
    expect(last(root.getDescendants())).instanceOf(ChildDomainObject);
  });

  test('should test getThisAndDescendants', () => {
    expect(count(root.getThisAndDescendants())).toBe(8);
    expect(first(root.getThisAndDescendants())).toBe(root);
    expect(last(root.getThisAndDescendants())).instanceOf(ChildDomainObject);
  });

  test('should test getDescendantsByType', () => {
    expect(count(root.getDescendantsByType(ChildDomainObject))).toBe(5);
  });

  test('should test getThisAndDescendantsByType', () => {
    expect(count(root.getThisAndDescendantsByType(RootDomainObject))).toBe(1);
    expect(count(root.getThisAndDescendantsByType(ChildDomainObject))).toBe(5);
  });

  test('should test getDescendantByType', () => {
    const descendant = root.getChild(0).getChild(0);
    expect(root.getDescendantByType(ChildDomainObject)).toBe(descendant);
    expect(root.getDescendantByType(RootDomainObject)).toBeUndefined();
  });

  test('should test getThisOrDescendantByUniqueId', () => {
    for (const descendant of root.getThisAndDescendants()) {
      expect(root.getThisOrDescendantByUniqueId(descendant.uniqueId)).toBe(descendant);
    }
  });
  test('should test getSelectedDescendant', () => {
    expect(root.getSelectedDescendant()).toBeUndefined();
    for (const descendant of root.getDescendants()) {
      descendant.isSelected = true;
      expect(root.getSelectedDescendant()).toBe(descendant);
      descendant.isSelected = false;
    }
  });

  test('should test getSelectedDescendantByType', () => {
    expect(root.getSelectedDescendantByType(ChildDomainObject)).toBeUndefined();
    for (const descendant of root.getDescendantsByType(ChildDomainObject)) {
      descendant.isSelected = true;
      expect(root.getSelectedDescendantByType(ChildDomainObject)).toBe(descendant);
      descendant.isSelected = false;
    }
  });

  test('should test getActiveDescendantByType', () => {
    expect(root.getActiveDescendantByType(ChildDomainObject)).toBeUndefined();
    for (const descendant of root.getDescendantsByType(ChildDomainObject)) {
      descendant.isActive = true;
      expect(root.getActiveDescendantByType(ChildDomainObject)).toBe(descendant);
      descendant.isActive = false;
    }
  });

  test('should test getAncestors', () => {
    const descendant = root.getChild(1).getChild(1);
    expect(count(descendant.getAncestors())).toBe(2);
    expect(first(descendant.getAncestors())).instanceOf(ParentDomainObject);
    expect(last(descendant.getAncestors())).toBe(root);
  });

  test('should test getThisAndAncestors', () => {
    const descendant = root.getChild(1).getChild(1);
    expect(count(descendant.getThisAndAncestors())).toBe(3);
    expect(first(descendant.getThisAndAncestors())).toBe(descendant);
    expect(last(descendant.getThisAndAncestors())).toBe(root);
  });

  test('should test getAncestorByType', () => {
    const descendant = root.getChild(1).getChild(1);
    let ancestor = descendant.getAncestorByType(RootDomainObject);
    expect(ancestor).toBe(root);
    ancestor = descendant.getAncestorByType(ChildDomainObject);
    expect(ancestor).toBeUndefined();
  });

  test('should test getThisOrAncestorByType', () => {
    const descendant = root.getChild(1).getChild(1);
    const ancestor = descendant.getThisOrAncestorByType(ChildDomainObject);
    expect(ancestor).toBe(descendant);
  });
});

class DefaultDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Child' };
  }
}

class ChildDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Child' };
  }

  public override get canBeActive(): boolean {
    return true;
  }

  public override get hasPanelInfo(): boolean {
    return true;
  }

  public override get renderStyleRoot(): DomainObject | undefined {
    return this.parent;
  }
}

class ParentRenderStyle extends RenderStyle {
  public anyNumber = 42;
  public override clone(): RenderStyle {
    return cloneDeep<ParentRenderStyle>(this);
  }
}

class ParentDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Parent' };
  }

  public override get isRenderStyleRoot(): boolean {
    return true;
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new ParentRenderStyle();
  }
}

class RootDomainObject extends DomainObject {
  public override get typeName(): TranslationInput {
    return { untranslated: 'Root' };
  }

  public override get isRoot(): boolean {
    return true;
  }
}

export class EventChangeTester {
  private _times = 0;

  // Set isCalled to true if the change is detected
  public constructor(domainObject: DomainObject, change: symbol) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    function listener(_domainObject: DomainObject, inputChange: DomainObjectChange): void {
      if (inputChange.isChanged(change)) {
        self._times++;
      }
    }
    domainObject.views.addEventListener(listener);
  }

  public toHaveBeenCalledTimes(expected: number): void {
    expect(this._times).toHaveBeenCalledTimes(expected);
  }

  public toHaveBeenCalledOnce(): void {
    expect(this._times).toBe(1);
  }

  public toHaveNotBeenCalled(): void {
    expect(this._times).toBe(0);
  }
}

function createHierarchy(): DomainObject {
  const root = new RootDomainObject();
  const parent1 = new ParentDomainObject();
  parent1.addChild(new ChildDomainObject());
  parent1.addChild(new ChildDomainObject());
  parent1.addChild(new ChildDomainObject());
  root.addChild(parent1);

  const parent2 = new ParentDomainObject();
  parent2.addChild(new ChildDomainObject());
  parent2.addChild(new ChildDomainObject());
  root.addChild(parent2);
  return root;
}

export function count<T>(iterable: Generator<T>): number {
  let count = 0;
  for (const _item of iterable) {
    count++;
  }
  return count;
}

export function last<T>(iterable: Generator<T>): T | undefined {
  let lastItem: T | undefined;
  for (const item of iterable) {
    lastItem = item;
  }
  return lastItem;
}

export function first<T>(iterable: Generator<T>): T | undefined {
  return iterable.next().value;
}
