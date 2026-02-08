/*!
 * Copyright 2026 Cognite AS
 */

import { Mock } from 'moq.ts';
import { Color, Matrix4, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { Overlay3DIcon } from '@reveal/3d-overlays';
import { jest } from '@jest/globals';
import { HtmlClusterRenderer } from './HtmlClusterRenderer';
import { ClusteredIconData, ClusterRenderParams } from './ClusterRenderingStrategy';

describe('HtmlClusterRenderer', () => {
  let renderer: HtmlClusterRenderer;

  beforeEach(() => {
    renderer = new HtmlClusterRenderer({ classPrefix: 'test-cluster' });
  });

  afterEach(() => {
    renderer.dispose();
    document.getElementById('test-cluster-styles')?.remove();
  });

  test('manages hovered cluster state correctly', () => {
    expect(renderer.getHoveredCluster()).toBeNull();

    const icon = createMockIcon();
    renderer.setHoveredCluster(icon);
    expect(renderer.getHoveredCluster()).toBe(icon);

    renderer.setHoveredCluster(null);
    expect(renderer.getHoveredCluster()).toBeNull();
  });

  test('creates and updates cluster DOM elements', () => {
    const params = createRenderParams();
    const icon = createMockIcon(new Vector3(0, 0, 0));
    const clusters = [createClusterData(icon, true, 25)];

    renderer.updateClusters(clusters, params);

    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container');
    expect(container).toBeTruthy();

    const clusterElement = container?.querySelector('.test-cluster-icon');
    expect(clusterElement).toBeTruthy();

    const countSpan = clusterElement?.querySelector('.test-cluster-count');
    expect(countSpan?.textContent).toBe('25');
  });

  test('handles visibility toggle and 999+ display correctly', () => {
    const params = createRenderParams();
    const icon = createMockIcon();
    const clusters = [createClusterData(icon, true, 1500)];

    renderer.updateClusters(clusters, params);
    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container') as HTMLElement;

    expect(container?.style.display).not.toBe('none');

    renderer.setVisible(false);
    expect(container?.style.display).toBe('none');

    renderer.setVisible(true);
    expect(container?.style.display).toBe('block');

    const countSpan = container?.querySelector('.test-cluster-count');
    expect(countSpan?.textContent).toBe('999+');
  });

  test('removes elements when clusters disappear and cleans up on dispose', () => {
    const params = createRenderParams();
    const icon = createMockIcon();
    const clusters = [createClusterData(icon, true, 10)];

    renderer.updateClusters(clusters, params);
    const container = params.renderer.domElement.parentElement?.querySelector('.test-cluster-container');
    expect(container?.querySelectorAll('.test-cluster-icon').length).toBe(1);

    renderer.updateClusters([], params);

    jest.useFakeTimers();
    jest.advanceTimersByTime(200);
    jest.useRealTimers();

    renderer.dispose();
    expect(params.renderer.domElement.parentElement?.querySelector('.test-cluster-container')).toBeNull();
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
  return {
    icon,
    isCluster,
    clusterSize: size,
    clusterPosition: icon.getPosition(),
    sizeScale: isCluster ? 5.5 : 1
  };
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

  return {
    renderer: mockRenderer,
    camera,
    modelTransform: new Matrix4(),
    hoveredClusterIcon: null
  };
}
