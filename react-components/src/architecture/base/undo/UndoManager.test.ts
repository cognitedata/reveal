/*!
 * Copyright 2024 Cognite AS
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { Changes } from '../domainObjectsHelpers/Changes';
import { UndoManager } from './UndoManager';
import { MeasureBoxDomainObject } from '../../concrete/measurements/MeasureBoxDomainObject';
import { PrimitiveType } from '../utilities/primitives/PrimitiveType';
import { expectEqualVector3 } from '../../../../tests/tests-utilities/primitives/primitiveTestUtil';
import { type BoxDomainObject } from '../../concrete/primitives/box/BoxDomainObject';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';
import { createRenderTargetMock2 } from '../../../../tests/tests-utilities/fixtures/renderTarget';
import { type RootDomainObject } from '../domainObjects/RootDomainObject';
import { Box } from '../utilities/primitives/Box';

describe('UndoManager', () => {
  let renderTarget: RevealRenderTarget;
  let root: RootDomainObject;
  let manager: UndoManager;
  beforeEach(() => {
    renderTarget = createRenderTargetMock2();
    root = renderTarget.rootDomainObject;
    manager = new UndoManager();
  });

  test('Should updated the state of the UndoManager', () => {
    const domainObject = createBoxDomainObject();
    root.addChildInteractive(domainObject);

    // Change name
    const transaction = domainObject.createTransaction(Changes.active); // Just fake a change
    expect(manager.canUndo).toBe(false);
    expect(manager.addTransaction(transaction)).toBe(true);

    // Undo
    expect(manager.hasUniqueId(domainObject.uniqueId)).toBe(true);
    expect(manager.canUndo).toBe(true);
    manager.undo(renderTarget);
    expect(manager.hasUniqueId(domainObject.uniqueId)).toBe(false);
    expect(manager.canUndo).toBe(false);
  });

  test('Should undo geometry and name change', () => {
    const domainObject = createBoxDomainObject();
    root.addChildInteractive(domainObject);
    const oldBox = new Box().copy(domainObject.box);
    const oldName = domainObject.name;

    {
      // Change some geometry
      const transaction = domainObject.createTransaction(Changes.geometry);
      manager.addTransaction(transaction);
      domainObject.box.size.multiplyScalar(3);
      domainObject.box.center.addScalar(3);
      domainObject.notify(Changes.geometry);
      expect(domainObject.box.size).not.toStrictEqual(oldBox.size);
      expect(domainObject.box.center).not.toStrictEqual(oldBox.center);
    }
    {
      // Change name
      const transaction = domainObject.createTransaction(Changes.naming);
      expect(manager.addTransaction(transaction)).toBe(false);
      domainObject.name = 'new name';
      domainObject.notify(Changes.naming);
      expect(domainObject.name).not.toBe(oldName);
    }
    // Undo
    manager.undo(renderTarget);
    expectEqualVector3(domainObject.box.size, oldBox.size);
    expectEqualVector3(domainObject.box.center, oldBox.center);
    expect(domainObject.name).toBe(oldName);
    expect(manager.canUndo).toBe(false);
  });

  test('Should undo add', () => {
    // Add the new domainObject
    const domainObject = createBoxDomainObject();
    const transaction = domainObject.createTransaction(Changes.added);
    expect(manager.addTransaction(transaction)).toBe(true);
    root.addChildInteractive(domainObject);
    expect(root.getThisOrDescendantByUniqueId(domainObject.uniqueId)).toBeDefined();
    expect(domainObject.hasParent).toBe(true);

    // Undo
    manager.undo(renderTarget);
    expect(root.getThisOrDescendantByUniqueId(domainObject.uniqueId)).toBeUndefined();
    expect(domainObject.hasParent).toBe(false);
    expect(manager.canUndo).toBe(false);
  });

  test('Should undo deleted', () => {
    const domainObject = createBoxDomainObject();
    root.addChildInteractive(domainObject);
    const uniqueId = domainObject.uniqueId;

    // Delete the domain object
    const transaction = domainObject.createTransaction(Changes.deleted);
    expect(manager.addTransaction(transaction)).toBe(true);
    domainObject.removeInteractive();
    expect(root.getThisOrDescendantByUniqueId(uniqueId)).toBeUndefined();

    manager.undo(renderTarget);
    const restoredDomainObject = root.getThisOrDescendantByUniqueId(uniqueId);
    expect(restoredDomainObject).toBeDefined();
    expect(restoredDomainObject).not.toBe(domainObject);
    expect(manager.canUndo).toBe(false);
  });
});

function createBoxDomainObject(): BoxDomainObject {
  const domainObject = new MeasureBoxDomainObject(PrimitiveType.Box);
  const { box } = domainObject;
  box.size.set(1, 2, 3);
  box.center.set(4, 5, 6);
  return domainObject;
}
