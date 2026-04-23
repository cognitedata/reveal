/*!
 * Copyright 2026 Cognite AS
 */

import {
  CanvasTexture,
  InstancedMesh,
  CircleGeometry,
  MeshBasicMaterial,
  Matrix4,
  Object3D,
  Texture,
  Vector3
} from 'three';
import { Mock, It } from 'moq.ts';
import { jest } from '@jest/globals';
import { SceneHandler } from '@reveal/utilities';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { FlooredIconManager } from './FlooredIconManager';

describe(FlooredIconManager.name, () => {
  let addedObjects: Object3D[];
  let removedObjects: Object3D[];
  let mockSceneHandler: SceneHandler;

  const isFloorDiscMesh = (o: Object3D): o is InstancedMesh<CircleGeometry, MeshBasicMaterial> =>
    o instanceof InstancedMesh && o.renderOrder === 4;

  const isInstanceHidden = (mesh: InstancedMesh, index: number): boolean => {
    return index >= mesh.count;
  };

  const makeIcon = (pos: Vector3): Overlay3DIcon =>
    new Mock<Overlay3DIcon>()
      .setup(i => i.getPosition())
      .returns(pos)
      .object();

  const createManager = (capacity = 10) => {
    addedObjects = [];
    removedObjects = [];
    mockSceneHandler = new Mock<SceneHandler>()
      .setup(s => s.addObject3D(It.IsAny()))
      .callback(({ args }) => addedObjects.push(args[0]))
      .setup(s => s.removeObject3D(It.IsAny()))
      .callback(({ args }) => removedObjects.push(args[0]))
      .object();

    const hoverTexture = new CanvasTexture(document.createElement('canvas'));
    const manager = new FlooredIconManager(capacity, 0.3, 256, new Texture(), hoverTexture, mockSceneHandler);
    const discMeshes = addedObjects.filter(isFloorDiscMesh);
    return {
      manager,
      sameLevelMesh: discMeshes[0],
      elevatedMesh: discMeshes[1],
      hoverMesh: addedObjects.find(o => o.renderOrder === 5)!
    };
  };

  test('constructor registers 2 floor disc meshes and 1 hover mesh with sceneHandler', () => {
    const { manager } = createManager();
    expect(addedObjects.filter(isFloorDiscMesh)).toHaveLength(2);
    expect(addedObjects).toHaveLength(3);
    manager.dispose();
  });

  test('all floor disc meshes start invisible', () => {
    const { manager, sameLevelMesh, elevatedMesh } = createManager();
    expect(sameLevelMesh.visible).toBe(false);
    expect(elevatedMesh.visible).toBe(false);
    manager.dispose();
  });

  test('showMeshes makes all disc meshes visible', () => {
    const { manager, sameLevelMesh, elevatedMesh } = createManager();
    manager.showMeshes();
    expect(sameLevelMesh.visible).toBe(true);
    expect(elevatedMesh.visible).toBe(true);
    manager.dispose();
  });

  test('hideMeshesAndClearInstances hides all disc meshes', () => {
    const { manager, sameLevelMesh, elevatedMesh } = createManager();
    manager.showMeshes();
    manager.hideMeshesAndClearInstances();
    expect(sameLevelMesh.visible).toBe(false);
    expect(elevatedMesh.visible).toBe(false);
    manager.dispose();
  });

  describe('update', () => {
    const identity = new Matrix4();

    test('without reference icon all icons go to same-level mesh', () => {
      const { manager, sameLevelMesh, elevatedMesh } = createManager(5);
      const icons = [makeIcon(new Vector3(0, 0, 0)), makeIcon(new Vector3(0, 5, 0)), makeIcon(new Vector3(0, -3, 0))];

      manager.update(icons, identity);

      expect(isInstanceHidden(sameLevelMesh, 0)).toBe(false);
      expect(isInstanceHidden(sameLevelMesh, 1)).toBe(false);
      expect(isInstanceHidden(sameLevelMesh, 2)).toBe(false);
      expect(isInstanceHidden(elevatedMesh, 0)).toBe(true);
      manager.dispose();
    });

    test('with reference icon non-same-level icons go to elevated mesh', () => {
      const { manager, sameLevelMesh, elevatedMesh } = createManager(10);

      manager.setReferenceIcon(5);
      manager.update(
        [
          makeIcon(new Vector3(0, 5.5, 0)), // same level: 0.5m diff
          makeIcon(new Vector3(0, 7, 0)), // elevated: 2m above
          makeIcon(new Vector3(0, 3, 0)) // elevated: 2m below
        ],
        identity
      );

      expect(isInstanceHidden(sameLevelMesh, 0)).toBe(false);
      expect(isInstanceHidden(sameLevelMesh, 1)).toBe(true);
      expect(isInstanceHidden(elevatedMesh, 0)).toBe(false);
      expect(isInstanceHidden(elevatedMesh, 1)).toBe(false);
      expect(isInstanceHidden(elevatedMesh, 2)).toBe(true);
      manager.dispose();
    });

    test('icons exactly at the FloorLevelThreshold boundary are same-level, beyond it are elevated', () => {
      const { manager, sameLevelMesh, elevatedMesh } = createManager(10);
      const refY = 5;

      manager.setReferenceIcon(refY);
      manager.update(
        [
          makeIcon(new Vector3(0, refY + 1.0, 0)), // exactly at threshold: same-level
          makeIcon(new Vector3(0, refY + 1.01, 0)) // just above threshold: elevated
        ],
        identity
      );

      expect(isInstanceHidden(sameLevelMesh, 0)).toBe(false);
      expect(isInstanceHidden(elevatedMesh, 0)).toBe(false);
      manager.dispose();
    });

    test('elevated bucket is capped at 6 icons total', () => {
      const { manager, elevatedMesh } = createManager(20);

      manager.setReferenceIcon(5);
      const elevatedIcons = Array.from({ length: 8 }, (_, i) => makeIcon(new Vector3(i, 10, 0)));
      manager.update(elevatedIcons, identity);

      expect(isInstanceHidden(elevatedMesh, 0)).toBe(false);
      expect(isInstanceHidden(elevatedMesh, 1)).toBe(false);
      expect(isInstanceHidden(elevatedMesh, 2)).toBe(false);
      expect(isInstanceHidden(elevatedMesh, 3)).toBe(false);
      expect(isInstanceHidden(elevatedMesh, 4)).toBe(false);
      expect(isInstanceHidden(elevatedMesh, 5)).toBe(false);
      expect(elevatedMesh.count).toBe(6); // mesh capacity enforces the cap
      manager.dispose();
    });

    test('previously active instances are hidden when icon list shrinks', () => {
      const { manager, sameLevelMesh } = createManager(5);
      const icons = [makeIcon(new Vector3(0, 0, 0)), makeIcon(new Vector3(1, 0, 0))];

      manager.update(icons, identity);
      expect(isInstanceHidden(sameLevelMesh, 0)).toBe(false);
      expect(isInstanceHidden(sameLevelMesh, 1)).toBe(false);

      manager.update([icons[0]], identity);
      expect(isInstanceHidden(sameLevelMesh, 0)).toBe(false);
      expect(isInstanceHidden(sameLevelMesh, 1)).toBe(true);
      manager.dispose();
    });

    test('collection transform is applied to icon world positions', () => {
      const { manager, sameLevelMesh } = createManager(5);
      const icon = makeIcon(new Vector3(0, 0, 0));
      const transform = new Matrix4().makeTranslation(10, 10, 10);

      manager.update([icon], transform);

      const m = new Matrix4();
      sameLevelMesh.getMatrixAt(0, m);
      expect(m.elements[12]).toBeCloseTo(10); // tx
      expect(m.elements[13]).toBeCloseTo(10); // ty
      expect(m.elements[14]).toBeCloseTo(10); // tz
      manager.dispose();
    });

    test('instances are written farthest-first so closest icon renders on top (back-to-front)', () => {
      const { manager, sameLevelMesh } = createManager(5);
      // Icons passed closest-first: near at index 0, far at index 1
      const nearIcon = makeIcon(new Vector3(1, 0, 0));
      const farIcon = makeIcon(new Vector3(9, 0, 0));

      manager.update([nearIcon, farIcon], identity);

      // count=2: farthest is written at index 0, closest at index 1
      const m0 = new Matrix4();
      const m1 = new Matrix4();
      sameLevelMesh.getMatrixAt(0, m0);
      sameLevelMesh.getMatrixAt(1, m1);
      expect(m0.elements[12]).toBeCloseTo(9); // far icon at slot 0
      expect(m1.elements[12]).toBeCloseTo(1); // near icon at slot 1
      manager.dispose();
    });

    test('computeBoundingBox is called only when count changes, not on every update', () => {
      const { manager, sameLevelMesh } = createManager(5);
      const bbSpy = jest.spyOn(sameLevelMesh, 'computeBoundingBox');

      const icons = [makeIcon(new Vector3(0, 0, 0)), makeIcon(new Vector3(1, 0, 0))];

      // First update: count changes from -1 to 2 — should compute
      manager.update(icons, identity);
      expect(bbSpy).toHaveBeenCalledTimes(1);

      // Second update: same count — should skip
      manager.update(icons, identity);
      expect(bbSpy).toHaveBeenCalledTimes(1);

      // Third update: count changes to 1 — should recompute
      manager.update([icons[0]], identity);
      expect(bbSpy).toHaveBeenCalledTimes(2);

      manager.dispose();
    });
  });

  test('setOpacity applies to both disc meshes', () => {
    const { manager, sameLevelMesh, elevatedMesh } = createManager();
    manager.setOpacity(0.4);
    expect(sameLevelMesh.material.opacity).toBeCloseTo(0.4);
    expect(elevatedMesh.material.opacity).toBeCloseTo(0.4);
    manager.dispose();
  });

  test('setOccludedVisible applies depthTest to both disc meshes', () => {
    const { manager, sameLevelMesh, elevatedMesh } = createManager();
    manager.setOccludedVisible(true);
    expect(sameLevelMesh.material.depthTest).toBe(false);
    expect(elevatedMesh.material.depthTest).toBe(false);
    manager.setOccludedVisible(false);
    expect(sameLevelMesh.material.depthTest).toBe(true);
    expect(elevatedMesh.material.depthTest).toBe(true);
    manager.dispose();
  });

  test('setHoverPosition updates hover mesh position', () => {
    const { manager, hoverMesh } = createManager();
    manager.setHoverPosition(new Vector3(1, 2, 3));
    expect(hoverMesh.position.x).toBeCloseTo(1);
    expect(hoverMesh.position.y).toBeCloseTo(2);
    expect(hoverMesh.position.z).toBeCloseTo(3);
    manager.dispose();
  });

  test('hoverVisible setter controls hover mesh visibility', () => {
    const { manager, hoverMesh } = createManager();
    manager.hoverVisible = true;
    expect(hoverMesh.visible).toBe(true);
    manager.hoverVisible = false;
    expect(hoverMesh.visible).toBe(false);
    manager.dispose();
  });

  test('dispose removes all 3 registered objects from sceneHandler', () => {
    const { manager } = createManager();
    manager.dispose();
    expect(removedObjects).toHaveLength(3);
  });
});
