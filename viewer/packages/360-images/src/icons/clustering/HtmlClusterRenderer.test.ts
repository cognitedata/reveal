/*!
 * Copyright 2026 Cognite AS
 */

import { Mock } from 'moq.ts';
import { Color, Matrix4, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { jest } from '@jest/globals';
import { HtmlClusterRenderer } from './HtmlClusterRenderer';
import { ClusteredIconData, ClusterRenderParams } from './ClusterRenderingStrategy';
import assert from 'assert';

describe('HtmlClusterRenderer', () => {
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
    jest.useFakeTimers();
  });

  afterEach(() => {
    renderer.dispose();
    jest.useRealTimers();
  });

  test('creates and updates cluster DOM elements with correct count display', () => {
    renderer.updateClusters([createClusterData(iconAtOrigin, true, 25)], params);
    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container');
    assert(container);
    expect(container.querySelector('.test-cluster-icon')).toBeTruthy();
    expect(container.querySelector('.test-cluster-count')?.textContent).toBe('25');

    // Test 999+ display for large counts - update same icon to avoid element replacement
    renderer.updateClusters([createClusterData(iconAtOrigin, true, 1500)], params);
    expect(container.querySelector('.test-cluster-count')?.textContent).toBe('999+');
  });

  test('handles visibility toggle correctly', () => {
    renderer.updateClusters([createClusterData(defaultIcon, true, 10)], params);
    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container') as HTMLElement;
    assert(container);
    expect(container.style.display).not.toBe('none');
    renderer.setVisible(false);
    expect(container.style.display).toBe('none');
    renderer.setVisible(true);
    expect(container.style.display).toBe('block');
  });

  test('manages hovered cluster state and switches between icons correctly', () => {
    expect(renderer.getHoveredCluster()).toBeUndefined();
    renderer.setHoveredCluster(defaultIcon);
    expect(renderer.getHoveredCluster()).toBe(defaultIcon);
    renderer.setHoveredCluster(undefined);
    expect(renderer.getHoveredCluster()).toBeUndefined();

    // Test switching between different hovered icons
    const clusters = [createClusterData(iconAtOrigin, true, 5), createClusterData(iconAtOne, true, 10)];
    renderer.updateClusters(clusters, params);
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
    renderer.updateClusters([createClusterData(defaultIcon, true, 10)], params);
    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container');
    assert(container);
    expect(container.querySelectorAll('.test-cluster-icon').length).toBe(1);
    // children.length is 2: 1 injected <style> element + 1 cluster icon
    expect(container.children.length).toBe(2);

    renderer.updateClusters([], params);
    expect(container.querySelector('.test-cluster-icon')?.classList.contains('fade-out')).toBe(true);

    jest.advanceTimersByTime(200);
    expect(container.querySelectorAll('.test-cluster-icon[style*="display: flex"]').length).toBe(0);

    // Verify pool reuse - new cluster should reuse pooled element
    const newIcon = createMockIcon(new Vector3(2, 2, 2));
    renderer.updateClusters([createClusterData(newIcon, true, 20)], params);
    expect(container.querySelectorAll('.test-cluster-icon').length).toBe(1);
  });

  test('respects maxPoolSize by only pooling up to the limit', () => {
    const smallPoolRenderer = new HtmlClusterRenderer({ classPrefix: 'small-pool', maxPoolSize: 1 });
    const icon1 = createMockIcon(new Vector3(0, 0, 0));
    const icon2 = createMockIcon(new Vector3(1, 1, 1));

    // Add 2 clusters
    smallPoolRenderer.updateClusters([createClusterData(icon1, true, 5), createClusterData(icon2, true, 10)], params);
    const container = params.renderer.domElement.parentElement?.querySelector('.small-pool-container');
    assert(container);
    const elements = container.querySelectorAll('.small-pool-icon');
    expect(elements.length).toBe(2);

    // Tag both elements so we can track which ones get reused
    elements[0].setAttribute('data-pool-tag', 'a');
    elements[1].setAttribute('data-pool-tag', 'b');

    // Release all elements (only 1 should be pooled due to maxPoolSize=1)
    smallPoolRenderer.updateClusters([], params);
    jest.advanceTimersByTime(200);

    // Add 2 new clusters — 1 should come from the pool (tagged), 1 should be freshly created (untagged)
    const icon3 = createMockIcon(new Vector3(2, 2, 2));
    const icon4 = createMockIcon(new Vector3(3, 3, 3));
    smallPoolRenderer.updateClusters([createClusterData(icon3, true, 15), createClusterData(icon4, true, 20)], params);
    const newElements = container.querySelectorAll('.small-pool-icon');
    expect(newElements.length).toBe(2);

    const taggedCount = Array.from(newElements).filter(el => el.hasAttribute('data-pool-tag')).length;
    expect(taggedCount).toBe(1);

    smallPoolRenderer.dispose();
    document.getElementById('small-pool-styles')?.remove();
  });

  test('dispose clears active elements, pooled elements, and pending timeouts', () => {
    renderer.updateClusters([createClusterData(defaultIcon, true, 10)], params);
    renderer.updateClusters([], params);
    jest.advanceTimersByTime(200);

    renderer.dispose();
    expect(params.renderer.domElement.parentElement?.querySelector('.test-cluster-container')).toBeNull();

    const newRenderer = new HtmlClusterRenderer({ classPrefix: 'timeout-test' });
    const newParams = createRenderParams();
    newRenderer.updateClusters([createClusterData(defaultIcon, true, 10)], newParams);
    newRenderer.updateClusters([], newParams);

    newRenderer.dispose();
    expect(() => jest.advanceTimersByTime(200)).not.toThrow();

    document.getElementById('timeout-test-styles')?.remove();
  });

  test('does not inject styles if already present', () => {
    const testPrefix = 'style-inject-test';
    const existingStyle = document.createElement('style');
    existingStyle.id = `${testPrefix}-styles`;
    existingStyle.textContent = '.existing-rule {}';
    document.head.appendChild(existingStyle);

    const testRenderer = new HtmlClusterRenderer({ classPrefix: testPrefix });
    expect(document.querySelectorAll(`#${testPrefix}-styles`).length).toBe(1);
    expect(document.querySelector(`#${testPrefix}-styles`)?.textContent).toBe('.existing-rule {}');

    testRenderer.dispose();
    existingStyle.remove();
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
      modelTransform: new Matrix4(),
      hoveredClusterIcon: null
    };
    expect(() => renderer.updateClusters([createClusterData(defaultIcon, true, 10)], orphanParams)).not.toThrow();
    expect(orphanCanvas.parentElement).toBeNull();
  });

  test('hover animations are disabled when enableHoverAnimations is false', () => {
    const noAnimRenderer = new HtmlClusterRenderer({ classPrefix: 'no-anim', enableHoverAnimations: false });
    noAnimRenderer.updateClusters([createClusterData(defaultIcon, true, 10)], params);
    noAnimRenderer.setHoveredCluster(defaultIcon);
    const element = params.renderer.domElement.parentElement?.querySelector('.no-anim-icon');
    assert(element);
    expect(element.classList.contains('hovered')).toBe(false);
    noAnimRenderer.dispose();
    document.getElementById('no-anim-styles')?.remove();
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
  return { renderer: mockRenderer, camera, modelTransform: new Matrix4(), hoveredClusterIcon: null };
}
