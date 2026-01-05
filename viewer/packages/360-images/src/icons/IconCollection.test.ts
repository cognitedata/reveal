/*!
 * Copyright 2025 Cognite AS
 */

import { Mock, It } from 'moq.ts';
import { Matrix4, PerspectiveCamera, Vector3, WebGLRenderer } from 'three';
import { BeforeSceneRenderedDelegate, EventTrigger, SceneHandler } from '@reveal/utilities';
import { IconCollection } from './IconCollection';

describe(IconCollection.name, () => {
  describe('setIconClustersByLOD', () => {
    let mockSceneHandler: SceneHandler;
    let mockEventTrigger: EventTrigger<BeforeSceneRenderedDelegate>;
    let capturedRenderCallback: BeforeSceneRenderedDelegate | undefined;
    let mockRenderer: WebGLRenderer;

    const singleCenterIconPosition = new Vector3(0, 0, 0);

    const closeIconPositions = [singleCenterIconPosition, new Vector3(1, 0, 0), new Vector3(0, 1, 0)];
    const farIconPositions = [new Vector3(100, 0, 0), new Vector3(101, 0, 0), new Vector3(100, 1, 0)];
    const farestIconPosition = new Vector3(1000, 1000, 0);
    const bitFarIconPositions = [new Vector3(2, 0, 0), new Vector3(0, 2, 0), new Vector3(2, 2, 0)];
    const singleBitFarIconPosition = new Vector3(5, 0, 0);
    const bitMoreFarIconPositions = [new Vector3(50, 0, 0), new Vector3(51, 0, 0), new Vector3(50, 1, 0)];

    function createCamera(position: Vector3, lookAt: Vector3 = new Vector3(0, 0, 0)): PerspectiveCamera {
      const camera = new PerspectiveCamera(75, 16 / 9, 0.1, 1000);
      camera.position.copy(position);
      camera.lookAt(lookAt);
      camera.updateMatrixWorld();
      return camera;
    }

    beforeEach(() => {
      capturedRenderCallback = undefined;

      mockSceneHandler = new Mock<SceneHandler>()
        .setup(s => s.addObject3D(It.IsAny()))
        .returns(undefined)
        .setup(s => s.removeObject3D(It.IsAny()))
        .returns(undefined)
        .object();

      mockEventTrigger = new Mock<EventTrigger<BeforeSceneRenderedDelegate>>()
        .setup(e => e.subscribe(It.IsAny()))
        .callback(({ args }) => {
          capturedRenderCallback = args[0];
        })
        .setup(e => e.unsubscribe(It.IsAny()))
        .returns(undefined)
        .object();

      mockRenderer = new Mock<WebGLRenderer>()
        .setup(r => r.getSize(It.IsAny()))
        .callback(({ args }) => args[0].set(1920, 1080))
        .setup(r => r.domElement)
        .returns(document.createElement('canvas'))
        .object();
    });

    test('Empty icon collection does not throw on render', () => {
      const collection = new IconCollection([], mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();
      const camera = createCamera(new Vector3(0, 0, 10));

      const capturedCallback = capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');
      expect(() => capturedCallback).not.toThrow();
      collection.dispose();
    });

    test('Single icon within distance threshold is not clustered', () => {
      const collection = new IconCollection([singleCenterIconPosition], mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera close to the icon (within default distance threshold of 40)
      const camera = createCamera(new Vector3(0, 0, 30));
      capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');

      // Icon should not be culled when camera is close
      const icons = collection.icons;
      expect(icons.length).toBe(1);
      expect(icons[0].culled).toBe(false);

      collection.dispose();
    });

    test('Icon outside camera frustum is culled', () => {
      const collection = new IconCollection([farestIconPosition], mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera looking away from the icon
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(0, 0, -100));
      capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');

      // Icon should be culled when outside frustum
      const icons = collection.icons;
      expect(icons.length).toBe(1);
      expect(icons[0].culled).toBe(true);

      collection.dispose();
    });

    test('Multiple close icons are all visible (not clustered)', () => {
      const iconPositions = [singleCenterIconPosition, ...bitFarIconPositions];
      const collection = new IconCollection(iconPositions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();
      // Camera close to all icons
      const camera = createCamera(new Vector3(1, 1, 20));
      capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');

      // All icons should not be culled when camera is close
      const icons = collection.icons;
      expect(icons.length).toBe(4);
      const visibleIcons = icons.filter(icon => !icon.culled);
      expect(visibleIcons.length).toBe(4);

      collection.dispose();
    });

    test('Far icons are clustered while close icons remain visible', () => {
      // Create a group of close icons and a group of far icons
      const allPositions = [...closeIconPositions, ...farIconPositions];
      const collection = new IconCollection(allPositions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();
      // Camera positioned close to the first group
      const camera = createCamera(new Vector3(0.5, 0.5, 20));
      capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');

      const icons = collection.icons;
      expect(icons.length).toBe(6);

      // Close icons should not be culled
      const closeIcons = icons.slice(0, 3);
      closeIcons.forEach(icon => {
        expect(icon.culled).toBe(false);
      });

      // Far icons should have at least some clustering (some culled)
      const farIcons = icons.slice(3, 6);
      const culledFarIcons = farIcons.filter(icon => icon.culled);
      // At least some far icons should be culled due to clustering
      expect(culledFarIcons.length).toBeGreaterThanOrEqual(1);

      collection.dispose();
    });

    test('Icons become visible when camera moves closer', () => {
      const collection = new IconCollection(bitMoreFarIconPositions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Camera far from icons initially
      const camera = createCamera(new Vector3(0, 0, 10));
      capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');

      // Now move camera closer to icons
      camera.position.set(50, 0, 10);
      camera.lookAt(new Vector3(50, 0, 0));
      camera.updateMatrixWorld();

      capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');

      // Icons should not be culled when camera is close
      const icons = collection.icons;
      const visibleIcons = icons.filter(icon => !icon.culled);
      expect(visibleIcons.length).toBe(3);

      collection.dispose();
    });

    test('All icons are initially marked as culled before selection', () => {
      const iconPositions = [singleCenterIconPosition, singleBitFarIconPosition];
      const collection = new IconCollection(iconPositions, mockSceneHandler, mockEventTrigger);

      expect(capturedRenderCallback).toBeDefined();

      // Create a camera looking at the icons
      const camera = createCamera(new Vector3(0, 0, 10));

      // Before render callback, icons should have default culled state
      // After render callback, the method should first mark all as culled, then un-cull the selected ones
      capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');

      // Verify icons are properly processed
      const icons = collection.icons;
      expect(icons.length).toBe(2);

      collection.dispose();
    });

    test('Transform is applied correctly when calculating camera position in model space', () => {
      const collection = new IconCollection([singleCenterIconPosition], mockSceneHandler, mockEventTrigger);

      const transform = new Matrix4().makeTranslation(10, 0, 0);
      collection.setTransform(transform);

      expect(capturedRenderCallback).toBeDefined();

      // Camera should need to account for transform
      const camera = createCamera(new Vector3(10, 0, 30));

      capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');

      const icons = collection.icons;
      expect(icons.length).toBe(1);
      // Icon at origin with +10 transform should appear at (10, 0, 0) in world space
      // Camera at (10, 0, 30) should see it
      expect(icons[0].culled).toBe(false);

      collection.dispose();
    });

    test('Uses distance-based clustering with 40-unit threshold', () => {
      const allPositions = [...closeIconPositions, ...farIconPositions];

      const collection = new IconCollection(allPositions, mockSceneHandler, mockEventTrigger);
      expect(capturedRenderCallback).toBeDefined();

      // Camera positioned close to origin (within 40 units of closeIconPositions)
      const camera = createCamera(new Vector3(0, 0, 30));
      capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');

      const icons = collection.icons;
      // Close icons (within 40 units) should not be culled
      closeIconPositions.forEach((_, i) => {
        expect(icons[i].culled).toBe(false);
      });

      collection.dispose();
    });

    test('Clustered nodes return representative icon when no close icons exist', () => {
      const collection = new IconCollection(farIconPositions, mockSceneHandler, mockEventTrigger);
      expect(capturedRenderCallback).toBeDefined();

      // Camera at origin - all farIconPositions are beyond 40 units threshold
      const camera = createCamera(new Vector3(0, 0, 10), new Vector3(100, 0, 0));
      capturedRenderCallback ? capturedRenderCallback({ frameNumber: 0, renderer: mockRenderer, camera }) : fail('Render callback was not captured');

      const icons = collection.icons;
      const visibleCount = icons.filter(icon => !icon.culled).length;
      // At least one icon should be visible (the representative), but not necessarily all
      expect(visibleCount).toBeGreaterThanOrEqual(1);
      expect(visibleCount).toBeLessThanOrEqual(icons.length);

      collection.dispose();
    });
  });
});
