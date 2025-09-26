/*!
 * Copyright 2021 Cognite AS
 */
import { Box3, Vector3, Group, Mesh, BufferGeometry, Material } from 'three';
import { SectorNode } from './SectorNode';
import { LevelOfDetail } from '../cad/LevelOfDetail';
import { jest } from '@jest/globals';

describe(SectorNode.name, () => {
  let sectorNode: SectorNode;
  let testGroup: Group;

  beforeEach(() => {
    sectorNode = new SectorNode(1, 'testSector', new Box3(new Vector3(-1, -1, -1), new Vector3(1, 1, 1)));
    testGroup = new Group();
  });

  test('should initialize with correct properties', () => {
    expect(sectorNode.sectorId).toBe(1);
    expect(sectorNode.sectorPath).toBe('testSector');
    expect(sectorNode.levelOfDetail).toBe(LevelOfDetail.Discarded);
    expect(sectorNode.visible).toBe(true);
  });

  test('should update geometry with valid group', () => {
    const mesh = new Mesh(new BufferGeometry(), new Material());
    testGroup.add(mesh);

    sectorNode.updateGeometry(testGroup, LevelOfDetail.Detailed);

    expect(sectorNode.group).toBe(testGroup);
    expect(sectorNode.levelOfDetail).toBe(LevelOfDetail.Detailed);
    expect(sectorNode.visible).toBe(true);
  });

  test('should update geometry with undefined group', () => {
    sectorNode.updateGeometry(undefined, LevelOfDetail.Discarded);

    expect(sectorNode.group).toBeUndefined();
    expect(sectorNode.levelOfDetail).toBe(LevelOfDetail.Discarded);
    expect(sectorNode.visible).toBe(false);
  });

  test('should reset geometry correctly', () => {
    const mesh = new Mesh(new BufferGeometry(), new Material());
    testGroup.add(mesh);

    // First set some geometry
    sectorNode.updateGeometry(testGroup, LevelOfDetail.Detailed);
    expect(sectorNode.group).toBe(testGroup);

    // Then reset it
    sectorNode.resetGeometry();
    expect(sectorNode.group).toBeUndefined();
    expect(sectorNode.levelOfDetail).toBe(LevelOfDetail.Discarded);
  });

  test('should handle multiple geometry updates', () => {
    const mesh1 = new Mesh(new BufferGeometry(), new Material());
    const mesh2 = new Mesh(new BufferGeometry(), new Material());
    const group1 = new Group();
    const group2 = new Group();
    group1.add(mesh1);
    group2.add(mesh2);

    // Set first geometry
    sectorNode.updateGeometry(group1, LevelOfDetail.Detailed);
    expect(sectorNode.group).toBe(group1);

    // Update to second geometry (should remove first)
    sectorNode.updateGeometry(group2, LevelOfDetail.Detailed);
    expect(sectorNode.group).toBe(group2);
    expect(sectorNode.children).not.toContain(group1);
  });

  test('should update timestamp when geometry changes', () => {
    const initialTimestamp = sectorNode.updatedTimestamp;

    // Force a small delay to ensure timestamp difference
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now + 100);

    sectorNode.updateGeometry(testGroup, LevelOfDetail.Detailed);
    expect(sectorNode.updatedTimestamp).toBeGreaterThan(initialTimestamp);

    jest.restoreAllMocks();
  });

  test('should handle LOD changes correctly', () => {
    sectorNode.updateGeometry(testGroup, LevelOfDetail.Detailed);
    expect(sectorNode.levelOfDetail).toBe(LevelOfDetail.Detailed);
    expect(sectorNode.visible).toBe(true);

    sectorNode.updateGeometry(testGroup, LevelOfDetail.Discarded);
    expect(sectorNode.levelOfDetail).toBe(LevelOfDetail.Discarded);
    expect(sectorNode.visible).toBe(false);
  });
});
