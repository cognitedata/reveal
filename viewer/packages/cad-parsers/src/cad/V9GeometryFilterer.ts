/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever, TypedArray, TypedArrayConstructor } from '@reveal/utilities';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import { computeBoundingBoxFromEllipseValues } from '../utilities/computeBoundingBoxFromAttributes';
import { filterPrimitivesOutsideClipBox } from './filterPrimitivesCommon';
import * as THREE from 'three';

export class V9GeometryFilterer {
  private static readonly _views = new Map<number, TypedArrayConstructor>([
    [1, Uint8Array],
    [4, Float32Array]
  ]);

  private static getAttributes<T extends THREE.BufferAttribute | THREE.InterleavedBufferAttribute>(
    geometry: THREE.BufferGeometry,
    filterType: new (...args: any[]) => T
  ): Map<string, T> {
    return new Map(
      Object.entries(geometry.attributes)
        .filter(namedAttribute => namedAttribute[1] instanceof filterType)
        .map(nameAttributePair => [nameAttributePair[0], nameAttributePair[1] as T])
    );
  }

  static filterGeometry(
    geometryBuffer: THREE.BufferGeometry,
    type: RevealGeometryCollectionType,
    clipBox?: THREE.Box3
  ): THREE.BufferGeometry {
    if (!clipBox) return geometryBuffer;

    switch (type) {
      case RevealGeometryCollectionType.BoxCollection:
        return V9GeometryFilterer.filterBoxCollection(geometryBuffer, clipBox);
      case RevealGeometryCollectionType.CircleCollection:
        break;
      case RevealGeometryCollectionType.ConeCollection:
        break;
      case RevealGeometryCollectionType.EccentricConeCollection:
        break;
      case RevealGeometryCollectionType.EllipsoidSegmentCollection:
        return V9GeometryFilterer.filterEllipsoidCollection(geometryBuffer, clipBox);
      case RevealGeometryCollectionType.GeneralCylinderCollection:
        break;
      case RevealGeometryCollectionType.GeneralRingCollection:
        break;
      case RevealGeometryCollectionType.QuadCollection:
        break;
      case RevealGeometryCollectionType.TorusSegmentCollection:
        break;
      case RevealGeometryCollectionType.TrapeziumCollection:
        break;
      case RevealGeometryCollectionType.NutCollection:
        break;

      case RevealGeometryCollectionType.InstanceMesh:
      case RevealGeometryCollectionType.TriangleMesh:
        return geometryBuffer;
      default:
        assertNever(type);
    }

    // TODO: Remove when done with the rest of the types:
    return geometryBuffer;
  }

  private static filterBoxCollection(geometryBuffer: THREE.BufferGeometry, clipBox: THREE.Box3): THREE.BufferGeometry {
    // TODO: This isn't done
    return geometryBuffer;
  }

  static filterEllipsoidCollectionVars = {
    center: new THREE.Vector3()
  };

  private static filterEllipsoidCollection(
    geometryBuffer: THREE.BufferGeometry,
    clipBox: THREE.Box3
  ): THREE.BufferGeometry {
    const { center } = V9GeometryFilterer.filterEllipsoidCollectionVars;

    const interleavedAttributeMap = V9GeometryFilterer.getAttributes(geometryBuffer, THREE.InterleavedBufferAttribute);

    const horizontalRadiusAttribute = interleavedAttributeMap.get('_horizontalRadius')!;
    const verticalRadiusAttribute = interleavedAttributeMap.get('_verticalRadius')!;
    const heightAttribute = interleavedAttributeMap.get('_height')!;
    const centerAttribute = interleavedAttributeMap.get('_center')!;

    const typedArray = horizontalRadiusAttribute.data.array as TypedArray;
    const sharedArray = new Uint8Array(typedArray.buffer);

    const newRawBuffer = filterPrimitivesOutsideClipBox(
      sharedArray,
      horizontalRadiusAttribute.data.stride * typedArray.BYTES_PER_ELEMENT,
      clipBox,
      (index, _elementSize, _attributeFloatValues, out) => {
        const r1 = horizontalRadiusAttribute.getX(index);
        const r2 = verticalRadiusAttribute.getX(index);
        const height = heightAttribute.getX(index);
        const centerX = centerAttribute.getX(index);
        const centerY = centerAttribute.getY(index);
        const centerZ = centerAttribute.getZ(index);

        center.set(centerX, centerY, centerZ);

        return computeBoundingBoxFromEllipseValues(r1, r2, height, centerX, centerY, centerZ, out);
      }
    );

    const newGeometry = new THREE.BufferGeometry();

    const bufferAttributeMap = V9GeometryFilterer.getAttributes(geometryBuffer, THREE.BufferAttribute);
    bufferAttributeMap.forEach((attribute, name) => {
      newGeometry.setAttribute(name, attribute);
    });

    newGeometry.setIndex(geometryBuffer.getIndex());

    interleavedAttributeMap.forEach((attribute, name) => {
      const stride = attribute.data.stride;
      const componentSize = (attribute.array as TypedArray).BYTES_PER_ELEMENT;

      const ComponentType = V9GeometryFilterer._views.get(componentSize)!;
      const interleavedAttributesBuffer = new THREE.InstancedInterleavedBuffer(
        new ComponentType(newRawBuffer.buffer),
        stride
      );

      newGeometry.setAttribute(
        name,
        new THREE.InterleavedBufferAttribute(
          interleavedAttributesBuffer,
          attribute.itemSize,
          attribute.offset,
          attribute.normalized
        )
      );
    });

    return newGeometry;
  }
}
