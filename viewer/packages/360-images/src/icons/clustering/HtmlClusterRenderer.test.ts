/*!
 * Copyright 2026 Cognite AS
 */

import { Mock } from 'moq.ts';
import type { WebGLRenderer } from 'three';
import { Color, Matrix4, PerspectiveCamera, Vector3 } from 'three';
import type { Overlay3DIcon } from '@reveal/3d-overlays';
import { vi } from 'vitest';
import { HtmlClusterRenderer } from './HtmlClusterRenderer';
import type { ClusteredIconData, ClusterRenderParams } from './ClusterRenderingStrategy';
import assert from 'assert';

describe(HtmlClusterRenderer.name, () => {
  let renderer: HtmlClusterRenderer;
  let params: ClusterRenderParams;
  let defaultIcon: Overlay3DIcon;
  let iconAtOrigin: Overlay3DIcon;
  let iconAtOne: Overlay3DIcon;

  beforeEach(() => {
    defaultIcon = createMockIcon();
    iconAtOrigin = createMockIcon(new Vector3(0, 0, 0));
    iconAtOne = createMockIcon(new Vector3(1, 1, 1));
    renderer = new HtmlClusterRenderer({ classPrefix: 'test-cluster' });
    params = createRenderParams();
    vi.useFakeTimers();
  });

  afterEach(() => {
    renderer.dispose();
    vi.useRealTimers();
  });

  test('creates and updates cluster DOM elements with correct count display', () => {
    renderer.prepareClusters([createClusterData(iconAtOrigin, true, 25)], params);
    renderer.applyWithOcclusion(new Set());
    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container');
    assert(container);
    expect(container.querySelector('.test-cluster-icon')).toBeTruthy();
    expect(container.querySelector('.test-cluster-count')?.textContent).toBe('25');

    // Test 999+ display for large counts - update same icon to avoid element replacement
    renderer.prepareClusters([createClusterData(iconAtOrigin, true, 1500)], params);
    renderer.applyWithOcclusion(new Set());
    expect(container.querySelector('.test-cluster-count')?.textContent).toBe('999+');
  });

  test('handles visibility toggle correctly', () => {
    renderer.prepareClusters([createClusterData(defaultIcon, true, 10)], params);
    renderer.applyWithOcclusion(new Set());
    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container') as HTMLElement;
    assert(container);
    expect(container.style.display).not.toBe('none');
    renderer.setVisible(false);
    expect(container.style.display).toBe('none');
    renderer.setVisible(true);
    expect(container.style.display).toBe('block');
  });

  test('setVisible(false) removes all cluster DOM elements and clears hover state', () => {
    const cluster1 = createClusterData(iconAtOrigin, true, 5);
    const cluster2 = createClusterData(iconAtOne, true, 10);
    renderer.prepareClusters([cluster1, cluster2], params);
    renderer.applyWithOcclusion(new Set());
    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container');
    assert(container);
    expect(container.querySelectorAll('.test-cluster-icon').length).toBe(2);

    renderer.setHoveredCluster(iconAtOrigin);
    expect(renderer.getHoveredCluster()).toBe(iconAtOrigin);

    renderer.setVisible(false);

    // All cluster icon elements removed from DOM
    expect(container.querySelectorAll('.test-cluster-icon').length).toBe(0);
    // Hovered state cleared
    expect(renderer.getHoveredCluster()).toBeUndefined();

    // Elements are pooled and reused after re-enabling
    renderer.setVisible(true);
    const newIcon = createMockIcon(new Vector3(2, 2, 2));
    renderer.prepareClusters([createClusterData(newIcon, true, 3)], params);
    renderer.applyWithOcclusion(new Set());
    const icons = container.querySelectorAll('.test-cluster-icon');
    expect(icons.length).toBe(1);
  });

  test('manages hovered cluster state and switches between icons correctly', () => {
    expect(renderer.getHoveredCluster()).toBeUndefined();
    renderer.setHoveredCluster(defaultIcon);
    expect(renderer.getHoveredCluster()).toBe(defaultIcon);
    renderer.setHoveredCluster(undefined);
    expect(renderer.getHoveredCluster()).toBeUndefined();

    // Test switching between different hovered icons
    const clusters = [createClusterData(iconAtOrigin, true, 5), createClusterData(iconAtOne, true, 10)];
    renderer.prepareClusters(clusters, params);
    renderer.applyWithOcclusion(new Set());
    expect(params.renderer.domElement.parentElement?.querySelectorAll('.test-cluster-icon').length).toBe(2);
    renderer.setHoveredCluster(iconAtOrigin);
    expect(renderer.getHoveredCluster()).toBe(iconAtOrigin);
    renderer.setHoveredCluster(iconAtOne);
    expect(renderer.getHoveredCluster()).toBe(iconAtOne);

    // Test setting hover on icon not in activeElements
    const orphanIcon = createMockIcon(new Vector3(5, 5, 5));
    expect(() => renderer.setHoveredCluster(orphanIcon)).not.toThrow();
    expect(renderer.getHoveredCluster()).toBe(orphanIcon);
  });

  test('releaseElement handles fade-out, pool reuse, and container removal', () => {
    renderer.prepareClusters([createClusterData(defaultIcon, true, 10)], params);
    renderer.applyWithOcclusion(new Set());
    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container');
    assert(container);
    expect(container.querySelectorAll('.test-cluster-icon').length).toBe(1);
    // children.length is 2: 1 injected <style> element + 1 cluster icon
    expect(container.children.length).toBe(2);

    renderer.prepareClusters([], params);
    renderer.applyWithOcclusion(new Set());
    expect(container.querySelector('.test-cluster-icon')?.classList.contains('fade-out')).toBe(true);

    vi.advanceTimersByTime(150);
    expect(container.querySelectorAll('.test-cluster-icon[style*="display: flex"]').length).toBe(0);

    // Verify pool reuse - new cluster should reuse pooled element
    const newIcon = createMockIcon(new Vector3(2, 2, 2));
    renderer.prepareClusters([createClusterData(newIcon, true, 20)], params);
    renderer.applyWithOcclusion(new Set());
    expect(container.querySelectorAll('.test-cluster-icon').length).toBe(1);
  });

  test('respects maxPoolSize by only pooling up to the limit', () => {
    const smallPoolRenderer = new HtmlClusterRenderer({ classPrefix: 'small-pool', maxPoolSize: 1 });
    const icon1 = createMockIcon(new Vector3(0, 0, 0));
    const icon2 = createMockIcon(new Vector3(1, 1, 1));

    // Add 2 clusters
    smallPoolRenderer.prepareClusters([createClusterData(icon1, true, 5), createClusterData(icon2, true, 10)], params);
    smallPoolRenderer.applyWithOcclusion(new Set());
    const container = params.renderer.domElement.parentElement?.querySelector('.small-pool-container');
    assert(container);
    const elements = container.querySelectorAll('.small-pool-icon');
    expect(elements.length).toBe(2);

    // Tag both elements so we can track which ones get reused
    elements[0].setAttribute('data-pool-tag', 'a');
    elements[1].setAttribute('data-pool-tag', 'b');

    // Release all elements (only 1 should be pooled due to maxPoolSize=1)
    smallPoolRenderer.prepareClusters([], params);
    smallPoolRenderer.applyWithOcclusion(new Set());
    vi.advanceTimersByTime(150);

    // Add 2 new clusters — 1 should come from the pool (tagged), 1 should be freshly created (untagged)
    const icon3 = createMockIcon(new Vector3(2, 2, 2));
    const icon4 = createMockIcon(new Vector3(3, 3, 3));
    smallPoolRenderer.prepareClusters([createClusterData(icon3, true, 15), createClusterData(icon4, true, 20)], params);
    smallPoolRenderer.applyWithOcclusion(new Set());
    const newElements = container.querySelectorAll('.small-pool-icon');
    expect(newElements.length).toBe(2);

    const taggedCount = Array.from(newElements).filter(el => el.hasAttribute('data-pool-tag')).length;
    expect(taggedCount).toBe(1);

    smallPoolRenderer.dispose();
  });

  test('dispose clears active elements, pooled elements, and pending timeouts', () => {
    renderer.prepareClusters([createClusterData(defaultIcon, true, 10)], params);
    renderer.applyWithOcclusion(new Set());
    renderer.prepareClusters([], params);
    renderer.applyWithOcclusion(new Set());
    vi.advanceTimersByTime(150);

    renderer.dispose();
    expect(params.renderer.domElement.parentElement?.querySelector('.test-cluster-container')).toBeNull();

    const newRenderer = new HtmlClusterRenderer({ classPrefix: 'timeout-test' });
    const newParams = createRenderParams();
    newRenderer.prepareClusters([createClusterData(defaultIcon, true, 10)], newParams);
    newRenderer.applyWithOcclusion(new Set());
    newRenderer.prepareClusters([], newParams);
    newRenderer.applyWithOcclusion(new Set());

    newRenderer.dispose();
    expect(() => vi.advanceTimersByTime(150)).not.toThrow();
  });

  test('container element has exactly one style child after initialization', () => {
    renderer.prepareClusters([createClusterData(defaultIcon, true, 10)], params);
    renderer.applyWithOcclusion(new Set());
    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container');
    assert(container);

    const styleElements = container.querySelectorAll('style');
    expect(styleElements.length).toBe(1);

    renderer.dispose();
  });

  test('does not attach container when canvas has no parent', () => {
    const orphanCanvas = document.createElement('canvas');
    const mockRenderer = new Mock<WebGLRenderer>()
      .setup(r => r.domElement)
      .returns(orphanCanvas)
      .object();
    const orphanParams: ClusterRenderParams = {
      renderer: mockRenderer,
      camera: new PerspectiveCamera(75, 16 / 9, 0.1, 1000),
      modelTransform: new Matrix4()
    };
    expect(() => {
      renderer.prepareClusters([createClusterData(defaultIcon, true, 10)], orphanParams);
      renderer.applyWithOcclusion(new Set());
    }).not.toThrow();
    expect(orphanCanvas.parentElement).toBeNull();
  });

  test('hover animations are disabled when enableHoverAnimations is false', () => {
    const noAnimRenderer = new HtmlClusterRenderer({ classPrefix: 'no-anim', enableHoverAnimations: false });
    noAnimRenderer.prepareClusters([createClusterData(defaultIcon, true, 10)], params);
    noAnimRenderer.applyWithOcclusion(new Set());
    noAnimRenderer.setHoveredCluster(defaultIcon);
    const element = params.renderer.domElement.parentElement?.querySelector('.no-anim-icon');

    assert(element);
    expect(element.classList.contains('hovered')).toBe(false);
    noAnimRenderer.dispose();
  });

  test('prepareClusters stages clusters and defers count update until applyWithOcclusion', () => {
    renderer.prepareClusters(
      [createClusterData(iconAtOrigin, true, 42), createClusterData(iconAtOne, true, 10)],
      params
    );

    const staged = renderer.getStagedScreenInfos();
    expect(staged.length).toBe(2);
    expect(staged[0].data.icon).toBe(iconAtOrigin);
    expect(staged[1].data.icon).toBe(iconAtOne);

    const countSpan = params.renderer.domElement.parentElement?.querySelector('.test-cluster-count');
    expect(countSpan?.textContent).toBe('');

    renderer.applyWithOcclusion(new Set());
    expect(countSpan?.textContent).toBe('42');

    renderer.prepareClusters([createClusterData(defaultIcon, false, 1)], params);
    expect(renderer.getStagedScreenInfos().length).toBe(0);
  });

  test('applyWithOcclusion fades an occluded cluster according to configured distance', () => {
    const fadeRenderer = new HtmlClusterRenderer({
      classPrefix: 'fade-test',
      clusterFadeStartDistance: 50,
      clusterFadeEndDistance: 150
    });

    fadeRenderer.prepareClusters([createClusterData(iconAtOrigin, true, 5)], params);
    fadeRenderer.applyWithOcclusion(new Set());
    const container = params.renderer.domElement.parentElement?.querySelector('.fade-test-container');
    assert(container);
    const element = container.querySelector('.fade-test-icon') as HTMLElement;
    assert(element);

    expect(element.style.getPropertyValue('--cluster-fade-opacity')).toBe('1');

    fadeRenderer.applyWithOcclusion(new Set([iconAtOrigin]));
    expect(element.style.getPropertyValue('--cluster-fade-opacity')).toBe('0.5');

    fadeRenderer.dispose();
  });
});

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
