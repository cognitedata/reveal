/*!
 * Copyright 2022 Cognite AS
 */

import { PointCloudNode } from './PointCloudNode';
import { createPointCloudNode } from '../../../test-utilities';

import type { WebGLRenderer } from 'three';
import { Box3, BufferAttribute, BufferGeometry, Euler, Matrix4, PerspectiveCamera, Points, Ray, Vector3 } from 'three';
import { PointCloudOctree, PointCloudOctreeNode } from './potree-three-loader';
import { Mock } from 'moq.ts';
import type { IPointCloudTreeGeometryNode } from './potree-three-loader/geometry/IPointCloudTreeGeometryNode';
import { vi } from 'vitest';
import type { PointCloudMaterial } from '../../rendering';
import { DEFAULT_CLASSIFICATION } from '../../rendering';
import { PointColorType, PointShape, PointSizeType } from '@reveal/rendering';
import { PointCloudObjectAppearanceTexture } from '../../rendering/src/pointcloud-rendering';
import { Cylinder } from '@reveal/utilities';
import {
  AnnotationIdPointCloudObjectCollection,
  DefaultPointCloudAppearance,
  StyledPointCloudVolumeCollection
} from '@reveal/pointcloud-styling';
import { Color, Plane } from 'three';
import { PickCacheInvalidator } from '@reveal/utilities';
import type { ClassicDataSourceType } from '@reveal/data-providers';

describe(PointCloudNode.name, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('picking returns a Promise', async () => {
    const node = createPointCloudNode();
    vi.spyOn(PointCloudOctree.prototype, 'pick').mockResolvedValue(null);

    const result = node.pick(new Mock<WebGLRenderer>().object(), new PerspectiveCamera(), new Ray());

    expect(result).toBeInstanceOf(Promise);
    await result;
  });

  test('getModelTransformation returns transformation set by setModelTransformation', () => {
    const node = createPointCloudNode();
    const transform = new Matrix4().makeRotationFromEuler(new Euler(190, 35, 230)).setPosition(new Vector3(12, 34, 12));

    node.setModelTransformation(transform.clone());
    const receivedTransform = node.getModelTransformation();

    expect(receivedTransform).toEqual(transform);
  });

  describe('stylableVolumeMetadata', () => {
    test('returns empty volume list when no annotation is provided', () => {
      const node = createPointCloudNode({ annotations: [] });
      expect(node.stylableVolumeMetadata).toEqual([]);
    });

    test('returns volume objects from annotation list', () => {
      const shape = new Cylinder(new Vector3(0, 0, 0), new Vector3(1, 1, 1), 1);
      const boundingBox = shape.createBoundingBox();
      const annotations = [
        {
          annotationId: 123,
          assetRef: { id: 345 },
          boundingBox,
          stylableObject: {
            shape,
            objectId: 1
          }
        },
        {
          annotationId: 124,
          instanceRef: { externalId: 'some-external-id', space: 'some-space' },
          boundingBox,
          stylableObject: {
            shape,
            objectId: 2
          }
        }
      ];

      const node = createPointCloudNode({ annotations });
      const result = [...node.stylableVolumeMetadata];

      expect([...result]).toEqual(annotations);
    });
  });

  describe('getSubtreePointsByBox', () => {
    test('returns empty array when octree root is undefined', () => {
      const node = createPointCloudNode();

      Object.defineProperty(node.octree, 'root', {
        get: vi.fn().mockReturnValue(undefined)
      });

      const box = new Box3(new Vector3(-10, -10, -10), new Vector3(10, 10, 10));

      const result = node.getSubtreePointsByBox(box);

      expect(result).toEqual([]);
    });

    test('returns points that are inside the given box', () => {
      const pointCloudOctree = new Mock<PointCloudOctree>()
        .setup(p => p.material)
        .returns(
          new Mock<PointCloudMaterial>()
            .setup(p => p.classification)
            .returns(DEFAULT_CLASSIFICATION)
            .setup(p => p.objectAppearanceTexture)
            .returns(new PointCloudObjectAppearanceTexture(1, 1))
            .object()
        )
        .setup(p => p.root)
        .returns(
          new PointCloudOctreeNode(
            new Mock<IPointCloudTreeGeometryNode>()
              .setup(p => p.children)
              .returns([])
              .setup(p => p.boundingBox)
              .returns(new Box3(new Vector3(1, 1, 1), new Vector3(15, 15, 15)))
              .object(),
            new Points(
              new BufferGeometry().setAttribute(
                'position',
                new BufferAttribute(new Float32Array([1, 1, 1, 15, 15, 15, 5, 5, 5]), 3)
              )
            )
          )
        )
        .object();

      const sourceMatrix = new Matrix4().identity();
      const node = new PointCloudNode(
        Symbol(),
        sourceMatrix,
        pointCloudOctree,
        [],
        { classificationSets: [] },
        new PickCacheInvalidator()
      );

      const box = new Box3(new Vector3(0, 0, 0), new Vector3(10, 10, 10));

      const result = node.getSubtreePointsByBox(box);

      expect(result.length).toBe(2);
      expect(result[0].equals(new Vector3(1, 1, 1))).toBeTruthy();
      expect(result[1].equals(new Vector3(5, 5, 5))).toBeTruthy();
    });
  });

  describe('pick cache invalidation', () => {
    const ANNOTATION_ID = 1;
    const OBJECT_ID = 0;
    const DEFAULT_CLASS_CODE = 2;

    const createStyledCollection = (appearance: {
      color?: Color;
      visible?: boolean;
    }): StyledPointCloudVolumeCollection<ClassicDataSourceType> =>
      new StyledPointCloudVolumeCollection(new AnnotationIdPointCloudObjectCollection([ANNOTATION_ID]), {
        ...DefaultPointCloudAppearance,
        ...appearance
      });

    // Style changes only take effect, and are compared, when the appearance texture is rebuilt for rendering
    const createNodeWithInvalidator = (): {
      node: PointCloudNode<ClassicDataSourceType>;
      pickCacheInvalidator: PickCacheInvalidator;
      rebuildStyles: () => void;
    } => {
      const pickCacheInvalidator = new PickCacheInvalidator();
      const node = createPointCloudNode<ClassicDataSourceType>({ pickCacheInvalidator });
      const texture = node.octree.material.objectAppearanceTexture;
      texture.setObjectsMaps({
        annotationToObjectIds: new Map([[ANNOTATION_ID, OBJECT_ID]]),
        objectToAnnotationIds: new Map([[OBJECT_ID, ANNOTATION_ID]])
      });
      texture.onBeforeRender();
      // Creating the node sets its initial point size, color type and shape.
      pickCacheInvalidator.consume();
      return { node, pickCacheInvalidator, rebuildStyles: () => texture.onBeforeRender() };
    };

    test('color-only styling redraws but does not invalidate the pick cache', () => {
      const { node, pickCacheInvalidator, rebuildStyles } = createNodeWithInvalidator();
      node.resetRedraw();

      node.assignStyledPointCloudObjectCollection(createStyledCollection({ color: new Color('red') }));
      rebuildStyles();

      expect(node.needsRedraw).toBe(true);
      expect(pickCacheInvalidator.consume()).toBe(false);
    });

    test('hiding objects invalidates the pick cache', () => {
      const { node, pickCacheInvalidator, rebuildStyles } = createNodeWithInvalidator();

      node.assignStyledPointCloudObjectCollection(createStyledCollection({ visible: false }));
      rebuildStyles();

      expect(pickCacheInvalidator.consume()).toBe(true);
    });

    test('a color-only style does not invalidate the pick cache while objects are hidden', () => {
      const { node, pickCacheInvalidator, rebuildStyles } = createNodeWithInvalidator();
      node.assignStyledPointCloudObjectCollection(createStyledCollection({ visible: false }));
      rebuildStyles();
      pickCacheInvalidator.consume();

      // Re-styling the already hidden object with only a color keeps it hidden
      node.assignStyledPointCloudObjectCollection(createStyledCollection({ color: new Color('red'), visible: false }));
      rebuildStyles();

      expect(pickCacheInvalidator.consume()).toBe(false);
    });

    test('removing a hiding style invalidates the pick cache', () => {
      const { node, pickCacheInvalidator, rebuildStyles } = createNodeWithInvalidator();
      const hidden = createStyledCollection({ visible: false });
      node.assignStyledPointCloudObjectCollection(hidden);
      rebuildStyles();
      pickCacheInvalidator.consume();

      node.removeStyledPointCloudObjectCollection(hidden);
      rebuildStyles();

      expect(pickCacheInvalidator.consume()).toBe(true);
    });

    test('removing all styled objects invalidates the pick cache when a style hid objects', () => {
      const { node, pickCacheInvalidator, rebuildStyles } = createNodeWithInvalidator();
      node.assignStyledPointCloudObjectCollection(createStyledCollection({ visible: false }));
      rebuildStyles();
      pickCacheInvalidator.consume();

      node.removeAllStyledPointCloudObjects();
      rebuildStyles();

      expect(pickCacheInvalidator.consume()).toBe(true);
    });

    test('default appearance invalidates the pick cache only when it changes visibility', () => {
      const { node, pickCacheInvalidator, rebuildStyles } = createNodeWithInvalidator();

      node.defaultAppearance = { ...DefaultPointCloudAppearance, color: new Color('red') };
      rebuildStyles();
      expect(pickCacheInvalidator.consume()).toBe(false);

      node.defaultAppearance = { ...DefaultPointCloudAppearance, visible: false };
      rebuildStyles();
      expect(pickCacheInvalidator.consume()).toBe(true);
    });

    test.each([
      ['point size', (node: PointCloudNode) => (node.pointSize = 5)],
      ['point size type', (node: PointCloudNode) => (node.pointSizeType = PointSizeType.Adaptive)],
      ['point shape', (node: PointCloudNode) => (node.pointShape = PointShape.Square)],
      [
        'model transformation',
        (node: PointCloudNode) => node.setModelTransformation(new Matrix4().makeTranslation(1, 2, 3))
      ],
      ['clipping planes', (node: PointCloudNode) => (node.clippingPlanes = [new Plane(new Vector3(1, 0, 0), 2)])],
      ['class visibility', (node: PointCloudNode) => node.setClassVisible(DEFAULT_CLASS_CODE, false)]
    ])('%s invalidates the pick cache when it changes, and not when it is set to the same value', (_, change) => {
      const { node, pickCacheInvalidator } = createNodeWithInvalidator();

      change(node);
      expect(pickCacheInvalidator.consume()).toBe(true);

      node.resetRedraw();
      change(node);
      expect(pickCacheInvalidator.consume()).toBe(false);
      expect(node.needsRedraw).toBe(false);
    });

    test('point color type does not invalidate the pick cache', () => {
      const { node, pickCacheInvalidator } = createNodeWithInvalidator();

      node.pointColorType = PointColorType.Height;

      expect(pickCacheInvalidator.consume()).toBe(false);
    });
  });
});
