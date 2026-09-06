/*!
 * Copyright 2026 Cognite AS
 */

import { Mock } from 'moq.ts';
import type { BufferGeometry, WebGLRenderer } from 'three';
import { Color, Matrix4, PerspectiveCamera, Points, Texture, Vector3 } from 'three';
import type { Overlay3DIcon } from '@reveal/3d-overlays';
import { SpriteClusterRenderer } from './SpriteClusterRenderer';
import type { ClusteredIconData, ClusterRenderParams } from './ClusterRenderingStrategy';
import { CLUSTER_DIGIT_PLUS_INDEX, CLUSTER_DIGIT_UNUSED } from './clusterDigitAtlas';
import type { ClusterSpriteTextures } from './clusterSpriteTextures';

describe(SpriteClusterRenderer.name, () => {
  let renderer: SpriteClusterRenderer;
  let params: ClusterRenderParams;
  let defaultIcon: Overlay3DIcon;
  let iconAtOrigin: Overlay3DIcon;
  let iconAtOne: Overlay3DIcon;

  beforeEach(() => {
    defaultIcon = createMockIcon();
    iconAtOrigin = createMockIcon(new Vector3(0, 0, 0));
    iconAtOne = createMockIcon(new Vector3(1, 1, 1));
    renderer = new SpriteClusterRenderer({
      textures: createStubTextures(),
      maxClusters: 8
    });
    params = createRenderParams();
  });

  afterEach(() => {
    renderer.dispose();
  });

  test('stages cluster screen info and uploads digit sprites on apply', () => {
    renderer.prepareClusters([createClusterData(iconAtOrigin, true, 25)], params);
    expect(renderer.getStagedScreenInfos()).toHaveLength(1);
    expect(readDrawCount(renderer)).toBe(0);

    renderer.applyWithOcclusion(new Set());
    expect(readDrawCount(renderer)).toBe(1);
    expect(readDigits(renderer, 0)).toEqual([2, 5, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED]);
    expect(readMeta(renderer, 0)[0]).toBe(2);
  });

  test('encodes counts above 999 as 999+', () => {
    renderer.prepareClusters([createClusterData(iconAtOrigin, true, 1500)], params);
    renderer.applyWithOcclusion(new Set());
    expect(readDigits(renderer, 0)).toEqual([9, 9, 9, CLUSTER_DIGIT_PLUS_INDEX]);
    expect(readMeta(renderer, 0)[0]).toBe(4);
  });

  test('handles visibility toggle and clears uploaded clusters', () => {
    renderer.prepareClusters([createClusterData(defaultIcon, true, 10)], params);
    renderer.applyWithOcclusion(new Set());
    expect(renderer.object3D.visible).toBe(true);
    expect(readDrawCount(renderer)).toBe(1);

    renderer.setVisible(false);
    expect(renderer.object3D.visible).toBe(false);
    expect(readDrawCount(renderer)).toBe(0);
    expect(renderer.getHoveredCluster()).toBeUndefined();
    expect(renderer.getStagedScreenInfos()).toHaveLength(0);

    renderer.setVisible(true);
    renderer.prepareClusters([createClusterData(iconAtOne, true, 3)], params);
    renderer.applyWithOcclusion(new Set());
    expect(renderer.object3D.visible).toBe(true);
    expect(readDrawCount(renderer)).toBe(1);
  });

  test('manages hovered cluster state used by the hover ring sprite', () => {
    expect(renderer.getHoveredCluster()).toBeUndefined();
    renderer.setHoveredCluster(defaultIcon);
    expect(renderer.getHoveredCluster()).toBe(defaultIcon);

    renderer.prepareClusters(
      [createClusterData(iconAtOrigin, true, 5), createClusterData(iconAtOne, true, 10)],
      params
    );
    renderer.setHoveredCluster(iconAtOrigin);
    renderer.applyWithOcclusion(new Set());
    expect(readMeta(renderer, 0)[2]).toBe(1);
    expect(readMeta(renderer, 1)[2]).toBe(0);

    renderer.setHoveredCluster(iconAtOne);
    renderer.applyWithOcclusion(new Set());
    expect(readMeta(renderer, 0)[2]).toBe(0);
    expect(readMeta(renderer, 1)[2]).toBe(1);
  });

  test('does not apply hover visuals when hover animations are disabled', () => {
    const noHoverRenderer = new SpriteClusterRenderer({
      textures: createStubTextures(),
      maxClusters: 4,
      enableHoverAnimations: false
    });
    noHoverRenderer.prepareClusters([createClusterData(defaultIcon, true, 10)], params);
    noHoverRenderer.setHoveredCluster(defaultIcon);
    noHoverRenderer.applyWithOcclusion(new Set());
    expect(readMeta(noHoverRenderer, 0)[2]).toBe(0);
    noHoverRenderer.dispose();
  });

  test('prepareClusters ignores non-cluster icons and defers GPU upload until apply', () => {
    renderer.prepareClusters(
      [
        createClusterData(iconAtOrigin, true, 42),
        createClusterData(iconAtOne, true, 10),
        createClusterData(defaultIcon, false, 1)
      ],
      params
    );

    const staged = renderer.getStagedScreenInfos();
    expect(staged).toHaveLength(2);
    expect(staged[0].data.icon).toBe(iconAtOrigin);
    expect(staged[1].data.icon).toBe(iconAtOne);
    expect(readDrawCount(renderer)).toBe(0);

    renderer.applyWithOcclusion(new Set());
    expect(readDrawCount(renderer)).toBe(2);
    expect(readDigits(renderer, 0)).toEqual([4, 2, CLUSTER_DIGIT_UNUSED, CLUSTER_DIGIT_UNUSED]);
  });

  test('applyWithOcclusion fades an occluded cluster according to configured distance', () => {
    const fadeRenderer = new SpriteClusterRenderer({
      textures: createStubTextures(),
      maxClusters: 4,
      clusterFadeStartDistance: 50,
      clusterFadeEndDistance: 150
    });

    fadeRenderer.prepareClusters([createClusterData(iconAtOrigin, true, 5)], params);
    fadeRenderer.applyWithOcclusion(new Set());
    expect(readMeta(fadeRenderer, 0)[1]).toBe(1);

    fadeRenderer.applyWithOcclusion(new Set([iconAtOrigin]));
    expect(readMeta(fadeRenderer, 0)[1]).toBeCloseTo(0.5);

    fadeRenderer.dispose();
  });

  test('drops fully faded occluded clusters from the GPU buffer', () => {
    const fadeRenderer = new SpriteClusterRenderer({
      textures: createStubTextures(),
      maxClusters: 4,
      clusterFadeStartDistance: 10,
      clusterFadeEndDistance: 20
    });

    fadeRenderer.prepareClusters([createClusterData(iconAtOrigin, true, 5)], params);
    fadeRenderer.applyWithOcclusion(new Set([iconAtOrigin]));
    expect(readDrawCount(fadeRenderer)).toBe(0);
    fadeRenderer.dispose();
  });

  test('setOpacity and setOccludedVisible update the points materials', () => {
    renderer.setOpacity(0.4);
    expect(renderer.object3D.getOpacity()).toBeCloseTo(0.4);
    expect(renderer.object3D.isBackPointsVisible()).toBe(true);
    renderer.setOccludedVisible(false);
    expect(renderer.object3D.isBackPointsVisible()).toBe(false);
  });

  test('dispose releases the points object without throwing', () => {
    renderer.prepareClusters([createClusterData(defaultIcon, true, 10)], params);
    renderer.applyWithOcclusion(new Set());
    expect(() => renderer.dispose()).not.toThrow();
  });
});

function createStubTextures(): ClusterSpriteTextures {
  return {
    ring: new Texture(),
    ringHover: new Texture(),
    digitAtlas: new Texture()
  };
}

function createMockIcon(position: Vector3 = new Vector3()): Overlay3DIcon {
  return new Mock<Overlay3DIcon>()
    .setup(i => i.getPosition())
    .returns(position)
    .setup(i => i.getColor())
    .returns(new Color(1, 1, 1))
    .object();
}

function createClusterData(icon: Overlay3DIcon, isCluster: boolean, size: number): ClusteredIconData {
  return { icon, isCluster, clusterSize: size, clusterPosition: icon.getPosition(), sizeScale: isCluster ? 5.5 : 1 };
}

function createRenderParams(): ClusterRenderParams {
  const canvas = document.createElement('canvas');
  canvas.width = 1920;
  canvas.height = 1080;
  const parent = document.createElement('div');
  parent.appendChild(canvas);
  const mockRenderer = new Mock<WebGLRenderer>()
    .setup(r => r.domElement)
    .returns(canvas)
    .object();
  const camera = new PerspectiveCamera(75, 16 / 9, 0.1, 1000);
  camera.position.set(0, 0, 100);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return { renderer: mockRenderer, camera, modelTransform: new Matrix4() };
}

function getSharedGeometry(renderer: SpriteClusterRenderer): BufferGeometry {
  const points = renderer.object3D.children.find(child => child instanceof Points) as Points;
  return points.geometry;
}

function readDrawCount(renderer: SpriteClusterRenderer): number {
  return getSharedGeometry(renderer).drawRange.count;
}

function readDigits(renderer: SpriteClusterRenderer, index: number): number[] {
  const attribute = getSharedGeometry(renderer).getAttribute('digits');
  return [attribute.getX(index), attribute.getY(index), attribute.getZ(index), attribute.getW(index)];
}

function readMeta(renderer: SpriteClusterRenderer, index: number): [number, number, number] {
  const attribute = getSharedGeometry(renderer).getAttribute('clusterMeta');
  return [attribute.getX(index), attribute.getY(index), attribute.getZ(index)];
}
