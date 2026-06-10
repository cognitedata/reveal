/*!
 * Copyright 2021 Cognite AS
 */

import type { WebGLRenderer } from 'three';
import { Vector2, Vector3 } from 'three';

import type { HtmlOverlayOptions, HtmlOverlayToolOptions, HtmlOverlayCreateClusterDelegate } from './HtmlOverlayTool';
import { HtmlOverlayTool } from './HtmlOverlayTool';

import type { Cognite3DViewer } from '@reveal/api';

import { vi } from 'vitest';
import { fakeGetBoundingClientRect, mockViewerComponents } from '../../../../test-utilities';
import type { DataSourceType } from '@reveal/data-providers';

const TIMER_ADVANCE_MS = 50;
describe(HtmlOverlayTool.name, () => {
  let canvasContainer: HTMLElement;
  let viewer: Cognite3DViewer<DataSourceType>;
  let renderer: WebGLRenderer;

  beforeEach(() => {
    vi.useFakeTimers();
    const components = mockViewerComponents();
    viewer = components.viewer;
    renderer = components.renderer;
    canvasContainer = components.canvasContainer;
  });

  test('add() only accepts absolute position', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const htmlElement = document.createElement('div');
    htmlElement.className = 'overlay';
    htmlElement.style.position = 'relative';
    const position = new Vector3();

    // Act & Assert
    expect(() => {
      helper.add(htmlElement, position);
      vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    }).toThrowError();
  });

  test('add() accepts position set to absolute through cssText', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const htmlElement = document.createElement('div');
    htmlElement.style.cssText = 'position: absolute;';
    const position = new Vector3();

    // Act & Assert
    expect(() => helper.add(htmlElement, position)).not.toThrow();
  });

  test('add() places overlays correctly', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    expect(htmlElement.style.top).toHaveLength(0);
    expect(htmlElement.style.left).toHaveLength(0);
    const position = new Vector3(0, 0, 0.5);

    // Act
    helper.add(htmlElement, position);
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    helper.forceUpdate();

    // Assert
    expect(htmlElement.style.visibility).toBe('visible');
    expect(htmlElement.style.left).toBe(`${renderer.domElement.width / 2}px`);
    expect(htmlElement.style.top).toBe(`${renderer.domElement.height / 2}px`);
  });

  test('Hides overlay if behind camera or behind far plane', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const behindCameraElement = document.createElement('div');
    behindCameraElement.style.position = 'absolute';
    const behindFarPlaneElement = document.createElement('div');
    behindFarPlaneElement.style.position = 'absolute';

    // Act
    helper.add(behindCameraElement, new Vector3(0, 0, -1));
    helper.add(behindFarPlaneElement, new Vector3(0, 0, 10));
    helper.forceUpdate();

    // Assert
    expect(behindCameraElement.style.visibility).toBe('hidden');
    expect(behindFarPlaneElement.style.visibility).toBe('hidden');
  });

  test('visible() hides or unhides elements in the overlay', () => {
    const helper = new HtmlOverlayTool(viewer);
    const htmlElement = document.createElement('div');
    htmlElement.style.position = 'absolute';
    const position = new Vector3(0, 0, 0.5);

    helper.add(htmlElement, position);
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);

    helper.forceUpdate();

    expect(htmlElement.style.visibility).toBe('visible');

    helper.visible(false);
    helper.forceUpdate();
    expect(htmlElement.style.visibility).toBe('hidden');

    helper.visible(true);
    helper.forceUpdate();
    expect(htmlElement.style.visibility).toBe('visible');
  });

  test('Triggers position update callback', () => {
    // Arrange
    const helper = new HtmlOverlayTool(viewer);
    const behindCameraElement = document.createElement('div');
    behindCameraElement.style.position = 'absolute';
    const behindFarPlaneElement = document.createElement('div');
    behindFarPlaneElement.style.position = 'absolute';
    const withinNearAndFarPlaneElement = document.createElement('div');
    withinNearAndFarPlaneElement.style.position = 'absolute';
    const options: HtmlOverlayOptions = { positionUpdatedCallback: vi.fn() };

    // Act
    helper.add(behindCameraElement, new Vector3(0, 0, -1), { ...options, userData: 'behindCameraElement' });
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    helper.add(behindFarPlaneElement, new Vector3(0, 0, 10), { ...options, userData: 'behindFarPlaneElement' });
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    helper.add(withinNearAndFarPlaneElement, new Vector3(0, 0, 0.5), {
      ...options,
      userData: 'withinNearAndFarPlaneElement'
    });
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);

    helper.forceUpdate();

    // Assert
    expect(options.positionUpdatedCallback).toHaveBeenCalledWith(
      behindCameraElement,
      expect.any(Vector2),
      expect.any(Vector3),
      expect.anything(),
      'behindCameraElement'
    );
    expect(options.positionUpdatedCallback).toHaveBeenCalledWith(
      behindFarPlaneElement,
      expect.any(Vector2),
      expect.any(Vector3),
      expect.anything(),
      'behindFarPlaneElement'
    );
    expect(options.positionUpdatedCallback).toHaveBeenCalledWith(
      withinNearAndFarPlaneElement,
      expect.any(Vector2),
      expect.any(Vector3),
      expect.anything(),
      'withinNearAndFarPlaneElement'
    );
  });

  test('dispose() removes all overlays', () => {
    // Arrange
    const initialNumberOfElements = canvasContainer.children.length;
    const helper = new HtmlOverlayTool(viewer);
    for (let i = 0; i < 10; i++) {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      helper.add(element, new Vector3(0, 0, 0));
      vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    }
    expect(canvasContainer.children.length).toBe(initialNumberOfElements + 10);

    // Act
    helper.dispose();

    // Assert
    expect(canvasContainer.children.length).toBe(initialNumberOfElements);
  });

  test('all elements are removed when viewer is disposed', () => {
    // Arrange
    const initialNumberOfElements = canvasContainer.children.length;
    const helper = new HtmlOverlayTool(viewer);
    for (let i = 0; i < 10; i++) {
      const element = document.createElement('div');
      element.style.position = 'absolute';
      helper.add(element, new Vector3(0, 0, 0));
      vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    }

    // Act
    viewer.dispose();

    // Assert
    expect(canvasContainer.children.length).toBeLessThanOrEqual(initialNumberOfElements);
  });

  test('screenspace clustering combines overlapping elements', () => {
    // Arrange
    const createClusterElementCallback = vi
      .fn<HtmlOverlayCreateClusterDelegate>()
      .mockReturnValue(document.createElement('div'));
    const options: HtmlOverlayToolOptions = {
      clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback }
    };
    const helper = new HtmlOverlayTool(viewer, options);

    const div1 = document.createElement('div');
    fakeGetBoundingClientRect(div1, 0, 0, 64, 18);
    div1.style.position = 'absolute';
    const div2 = document.createElement('div');
    div2.style.position = 'absolute';
    fakeGetBoundingClientRect(div2, 0, 0, 64, 18);

    // Act
    helper.add(div1, new Vector3(0, 0, 0.5));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);

    helper.add(div2, new Vector3(0, 0, 0.7));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);

    helper.forceUpdate();

    // Assert
    expect(createClusterElementCallback).toHaveBeenCalledTimes(1);
    expect(div1.style.visibility).toEqual('hidden');
    expect(div2.style.visibility).toEqual('hidden');
  });

  test('clear() removes composite elements', () => {
    // Arrange
    const compositeElement = document.createElement('div');
    const createClusterElementCallback = vi.fn<HtmlOverlayCreateClusterDelegate>().mockReturnValue(compositeElement);
    const options: HtmlOverlayToolOptions = {
      clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback }
    };
    const helper = new HtmlOverlayTool(viewer, options);

    const div1 = document.createElement('div');
    fakeGetBoundingClientRect(div1, 0, 0, 64, 18);
    div1.style.position = 'absolute';
    const div2 = document.createElement('div');
    div2.style.position = 'absolute';
    fakeGetBoundingClientRect(div2, 0, 0, 64, 18);

    // Act
    helper.add(div1, new Vector3(0, 0, 0.5));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);

    helper.add(div2, new Vector3(0, 0, 0.7));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);

    helper.forceUpdate();

    expect(div1.parentElement).not.toBeNull();
    expect(div2.parentElement).not.toBeNull();
    expect(compositeElement.parentElement).not.toBeNull();
    helper.clear();

    // Assert
    expect(div1.parentElement).toBeNull();
    expect(div2.parentElement).toBeNull();
    expect(compositeElement.parentElement).toBeNull();
  });

  test('screenspace clustering reuses composite element when composition unchanged', () => {
    // Arrange
    const compositeElement = document.createElement('div');
    const createClusterElementCallback = vi.fn<HtmlOverlayCreateClusterDelegate>().mockReturnValue(compositeElement);
    const options: HtmlOverlayToolOptions = {
      clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback }
    };
    const helper = new HtmlOverlayTool(viewer, options);

    const div1 = document.createElement('div');
    fakeGetBoundingClientRect(div1, 0, 0, 64, 18);
    div1.style.position = 'absolute';
    const div2 = document.createElement('div');
    div2.style.position = 'absolute';
    fakeGetBoundingClientRect(div2, 0, 0, 64, 18);

    helper.add(div1, new Vector3(0, 0, 0.5));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    helper.add(div2, new Vector3(0, 0, 0.7));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);

    // Act — first update creates the composite
    helper.forceUpdate();
    expect(createClusterElementCallback).toHaveBeenCalledTimes(1);
    expect(compositeElement.parentElement).not.toBeNull();

    // Act — second update should reuse the same composite, not call callback again
    helper.forceUpdate();
    expect(createClusterElementCallback).toHaveBeenCalledTimes(1);
    expect(compositeElement.parentElement).not.toBeNull();

    // Act — third update, same result
    helper.forceUpdate();
    expect(createClusterElementCallback).toHaveBeenCalledTimes(1);
  });

  test('screenspace clustering creates a new composite when composition changes', () => {
    // Arrange
    const createClusterElementCallback = vi
      .fn<HtmlOverlayCreateClusterDelegate>()
      .mockImplementation(() => document.createElement('div'));
    const options: HtmlOverlayToolOptions = {
      clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback }
    };
    const helper = new HtmlOverlayTool(viewer, options);

    const div1 = document.createElement('div');
    div1.style.position = 'absolute';
    fakeGetBoundingClientRect(div1, 0, 0, 64, 18);
    const div2 = document.createElement('div');
    div2.style.position = 'absolute';
    fakeGetBoundingClientRect(div2, 0, 0, 64, 18);
    const div3 = document.createElement('div');
    div3.style.position = 'absolute';
    fakeGetBoundingClientRect(div3, 0, 0, 64, 18);

    helper.add(div1, new Vector3(0, 0, 0.5));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    helper.add(div2, new Vector3(0, 0, 0.7));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);

    // Act — first cluster composition is {div1, div2}
    helper.forceUpdate();
    expect(createClusterElementCallback).toHaveBeenCalledTimes(1);

    // Adding a third overlapping element changes the cluster composition
    helper.add(div3, new Vector3(0, 0, 0.6));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    helper.forceUpdate();

    // Assert — callback invoked again to build a new composite
    expect(createClusterElementCallback).toHaveBeenCalledTimes(2);
  });

  test('removing an overlay detaches the composite that referenced it', () => {
    // Arrange
    const compositeElement = document.createElement('div');
    const createClusterElementCallback = vi.fn<HtmlOverlayCreateClusterDelegate>().mockReturnValue(compositeElement);
    const options: HtmlOverlayToolOptions = {
      clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback }
    };
    const helper = new HtmlOverlayTool(viewer, options);

    const div1 = document.createElement('div');
    div1.style.position = 'absolute';
    fakeGetBoundingClientRect(div1, 0, 0, 64, 18);
    const div2 = document.createElement('div');
    div2.style.position = 'absolute';
    fakeGetBoundingClientRect(div2, 0, 0, 64, 18);

    helper.add(div1, new Vector3(0, 0, 0.5));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    helper.add(div2, new Vector3(0, 0, 0.7));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);

    helper.forceUpdate();
    expect(compositeElement.parentElement).not.toBeNull();

    // Act — remove one of the clustered overlays
    helper.remove(div1);

    // Assert — composite is detached immediately, without waiting for next frame
    expect(compositeElement.parentElement).toBeNull();
  });

  test('forceUpdate cleans up composites even when all overlays are removed', () => {
    // Arrange
    const compositeElement = document.createElement('div');
    const createClusterElementCallback = vi.fn<HtmlOverlayCreateClusterDelegate>().mockReturnValue(compositeElement);
    const options: HtmlOverlayToolOptions = {
      clusteringOptions: { mode: 'overlapInScreenSpace', createClusterElementCallback }
    };
    const helper = new HtmlOverlayTool(viewer, options);

    const div1 = document.createElement('div');
    div1.style.position = 'absolute';
    fakeGetBoundingClientRect(div1, 0, 0, 64, 18);
    const div2 = document.createElement('div');
    div2.style.position = 'absolute';
    fakeGetBoundingClientRect(div2, 0, 0, 64, 18);

    helper.add(div1, new Vector3(0, 0, 0.5));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);
    helper.add(div2, new Vector3(0, 0, 0.7));
    vi.advanceTimersByTime(TIMER_ADVANCE_MS);

    helper.forceUpdate();
    expect(compositeElement.parentElement).not.toBeNull();

    // Act — remove the overlays directly so cluster invalidation happens via remove()
    helper.remove(div1);
    helper.remove(div2);
    // Even with zero overlays remaining, forceUpdate should not throw and should
    // leave no orphaned composite elements behind.
    expect(() => helper.forceUpdate()).not.toThrow();

    // Assert
    expect(compositeElement.parentElement).toBeNull();
  });
});
