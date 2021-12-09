/*!
 * Copyright 2021 Cognite AS
 */

import { assertNever, TypedArray, TypedArrayConstructor } from '@reveal/utilities';
import { RevealGeometryCollectionType } from '@reveal/sector-parser';
import {
  computeBoundingBoxFromCenterAndRadiusAttributes,
  computeBoundingBoxFromEllipseValues,
  computeBoundingBoxFromInstanceMatrixAttributes,
  computeBoundingBoxFromVertexAttributes
} from '../utilities/computeBoundingBoxFromAttributes';
import { filterPrimitivesOutsideClipBox } from './filterPrimitivesCommon';
import * as THREE from 'three';

export class V9GeometryFilterer {
  private static readonly _views = new Map<number, TypedArrayConstructor>([
    [1, Uint8Array],
    [4, Float32Array]
  ]);

  private static readonly quadBoundingBox = new THREE.Box3(
    new THREE.Vector3(-0.5, -0.5, -1e-4),
    new THREE.Vector3(0.5, 0.5, -1e-4)
  );

  private static readonly unitBoundingBox = new THREE.Box3(
    new THREE.Vector3(-0.5, -0.5, -0.5),
    new THREE.Vector3(0.5, 0.5, 0.5)
  );

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

    if (type == RevealGeometryCollectionType.InstanceMesh || type == RevealGeometryCollectionType.TriangleMesh)
      return geometryBuffer;

    const interleavedAttributes = V9GeometryFilterer.getAttributes(geometryBuffer, THREE.InterleavedBufferAttribute);
    let newArray: Uint8Array | undefined;

    switch (type) {
      case RevealGeometryCollectionType.BoxCollection:
        newArray = V9GeometryFilterer.filterBoxCollection(interleavedAttributes, clipBox);
        break;
      case RevealGeometryCollectionType.CircleCollection:
        newArray = V9GeometryFilterer.filterCircleCollection(interleavedAttributes, clipBox);
        break;
      case RevealGeometryCollectionType.ConeCollection:
        newArray = V9GeometryFilterer.filterConeCollection(interleavedAttributes, clipBox);
        break;
      case RevealGeometryCollectionType.EccentricConeCollection:
        newArray = V9GeometryFilterer.filterEccentricConeCollection(interleavedAttributes, clipBox);
        break;
      case RevealGeometryCollectionType.EllipsoidSegmentCollection:
        newArray = V9GeometryFilterer.filterEllipsoidCollection(interleavedAttributes, clipBox);
        break;
      case RevealGeometryCollectionType.GeneralCylinderCollection:
        newArray = V9GeometryFilterer.filterGeneralCylinderCollection(interleavedAttributes, clipBox);
        break;
      case RevealGeometryCollectionType.GeneralRingCollection:
        newArray = V9GeometryFilterer.filterGeneralRingCollection(interleavedAttributes, clipBox);
        break;
      case RevealGeometryCollectionType.QuadCollection:
        newArray = V9GeometryFilterer.filterQuadCollection(interleavedAttributes, clipBox);
        break;
      case RevealGeometryCollectionType.TorusSegmentCollection:
        newArray = V9GeometryFilterer.filterTorusCollection(interleavedAttributes, clipBox);
        break;
      case RevealGeometryCollectionType.TrapeziumCollection:
        newArray = V9GeometryFilterer.filterTrapeziumCollection(interleavedAttributes, clipBox);
        break;
      case RevealGeometryCollectionType.NutCollection:
        newArray = V9GeometryFilterer.filterNutCollection(interleavedAttributes, clipBox);
        break;
      default:
        assertNever(type);
    }

    return V9GeometryFilterer.createNewBufferGeometry(newArray, geometryBuffer, interleavedAttributes);
  }

  private static createNewBufferGeometry(
    array: Uint8Array,
    oldGeometryBuffer: THREE.BufferGeometry,
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>
  ) {
    const newGeometry = new THREE.BufferGeometry();

    const bufferAttributeMap = V9GeometryFilterer.getAttributes(oldGeometryBuffer, THREE.BufferAttribute);
    bufferAttributeMap.forEach((attribute, name) => {
      newGeometry.setAttribute(name, attribute);
    });

    newGeometry.setIndex(oldGeometryBuffer.getIndex());

    interleavedAttributeMap.forEach((attribute, name) => {
      const stride = attribute.data.stride;
      const componentSize = (attribute.array as TypedArray).BYTES_PER_ELEMENT;

      const ComponentType = V9GeometryFilterer._views.get(componentSize)!;
      const interleavedAttributesBuffer = new THREE.InstancedInterleavedBuffer(new ComponentType(array.buffer), stride);

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

  private static filterWithCallback(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    computeBoundingBoxCallback: (
      index: number,
      elementSize: number,
      attributeFloatValues: Float32Array,
      out: THREE.Box3
    ) => THREE.Box3,
    clipBox: THREE.Box3
  ): Uint8Array {
    const firstInterleavedAttribute = interleavedAttributeMap.values().next().value as THREE.InterleavedBufferAttribute;
    const typedArray = firstInterleavedAttribute.array as TypedArray;
    const sharedArray = new Uint8Array(typedArray.buffer);

    const newRawBuffer = filterPrimitivesOutsideClipBox(
      sharedArray,
      firstInterleavedAttribute.data.stride * typedArray.BYTES_PER_ELEMENT,
      clipBox,
      computeBoundingBoxCallback
    );

    return newRawBuffer;
  }

  private static filterOnInstanceMatrixAndBoundingBox(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    untransformedBoundingBox: THREE.Box3,
    clipBox: THREE.Box3
  ): Uint8Array {
    const computeCallback = (
      index: number,
      elementSize: number,
      attributeFloatValues: Float32Array,
      out: THREE.Box3
    ) => {
      const matrixAttribute = interleavedAttributeMap.get('_instanceMatrix')!;
      const matrixByteOffset = matrixAttribute.offset * (matrixAttribute.array as TypedArray).BYTES_PER_ELEMENT;

      return computeBoundingBoxFromInstanceMatrixAttributes(
        attributeFloatValues,
        matrixByteOffset,
        elementSize,
        index,
        untransformedBoundingBox,
        out
      );
    };

    return this.filterWithCallback(interleavedAttributeMap, computeCallback, clipBox);
  }

  private static filterOnCenterAndRadius(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3,
    radiusAAttributeName: string,
    radiusBAttributeName: string
  ): Uint8Array {
    const computeCallback = (
      index: number,
      elementSize: number,
      attributeFloatValues: Float32Array,
      out: THREE.Box3
    ): THREE.Box3 => {
      const centerAAttribute = interleavedAttributeMap.get('_centerA')!;
      const centerBAttribute = interleavedAttributeMap.get('_centerB')!;
      const radiusAAttribute = interleavedAttributeMap.get(radiusAAttributeName)!;
      const radiusBAttribute = interleavedAttributeMap.get(radiusBAttributeName)!;

      const byteSizeMultiplier = (centerAAttribute.array as TypedArray).BYTES_PER_ELEMENT;

      return computeBoundingBoxFromCenterAndRadiusAttributes(
        attributeFloatValues,
        centerAAttribute.offset * byteSizeMultiplier,
        centerBAttribute.offset * byteSizeMultiplier,
        radiusAAttribute.offset * byteSizeMultiplier,
        radiusBAttribute.offset * byteSizeMultiplier,
        elementSize,
        index,
        out
      );
    };
    return V9GeometryFilterer.filterWithCallback(interleavedAttributeMap, computeCallback, clipBox);
  }

  private static filterBoxCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    return V9GeometryFilterer.filterOnInstanceMatrixAndBoundingBox(
      interleavedAttributeMap,
      V9GeometryFilterer.unitBoundingBox,
      clipBox
    );
  }

  private static filterCircleCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    return V9GeometryFilterer.filterOnInstanceMatrixAndBoundingBox(
      interleavedAttributeMap,
      V9GeometryFilterer.quadBoundingBox,
      clipBox
    );
  }

  private static filterConeCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    return V9GeometryFilterer.filterOnCenterAndRadius(interleavedAttributeMap, clipBox, '_radiusA', '_radiusB');
  }

  private static filterEccentricConeCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    return V9GeometryFilterer.filterOnCenterAndRadius(interleavedAttributeMap, clipBox, '_radiusA', '_radiusB');
  }

  static filterEllipsoidCollectionVars = {
    center: new THREE.Vector3()
  };

  private static filterEllipsoidCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    const { center } = V9GeometryFilterer.filterEllipsoidCollectionVars;

    const computeCallback = (
      index: number,
      _elementSize: number,
      _attributeFloatValues: Float32Array,
      out: THREE.Box3
    ): THREE.Box3 => {
      const r1 = interleavedAttributeMap.get('_horizontalRadius')!.getX(index);
      const r2 = interleavedAttributeMap.get('_verticalRadius')!.getX(index);
      const height = interleavedAttributeMap.get('_height')!.getX(index);

      const centerAttribute = interleavedAttributeMap.get('_center')!;
      center.set(centerAttribute.getX(index), centerAttribute.getY(index), centerAttribute.getZ(index));

      return computeBoundingBoxFromEllipseValues(r1, r2, height, center, out);
    };

    return V9GeometryFilterer.filterWithCallback(interleavedAttributeMap, computeCallback, clipBox);
  }

  private static filterGeneralCylinderCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    return V9GeometryFilterer.filterOnCenterAndRadius(interleavedAttributeMap, clipBox, '_radius', '_radius');
  }

  private static filterGeneralRingCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    return V9GeometryFilterer.filterOnInstanceMatrixAndBoundingBox(
      interleavedAttributeMap,
      V9GeometryFilterer.quadBoundingBox,
      clipBox
    );
  }

  private static filterQuadCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    return V9GeometryFilterer.filterOnInstanceMatrixAndBoundingBox(
      interleavedAttributeMap,
      V9GeometryFilterer.quadBoundingBox,
      clipBox
    );
  }

  static filterTorusCollectionVars = {
    boundingBox: new THREE.Box3()
  };

  private static filterTorusCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    const { boundingBox } = this.filterTorusCollectionVars;

    const computeCallback = (
      index: number,
      elementSize: number,
      attributeFloatValues: Float32Array,
      out: THREE.Box3
    ): THREE.Box3 => {
      const radius = interleavedAttributeMap.get('_radius')!.getX(index);
      const tubeRadius = interleavedAttributeMap.get('_tubeRadius')!.getX(index);

      boundingBox.min.set(-radius - tubeRadius, -radius - tubeRadius, -tubeRadius);
      boundingBox.max.set(radius + tubeRadius, radius + tubeRadius, tubeRadius);

      const matrixAttribute = interleavedAttributeMap.get('_instanceMatrix')!;
      const matrixByteOffset = matrixAttribute.offset * (matrixAttribute.array as TypedArray).BYTES_PER_ELEMENT;

      return computeBoundingBoxFromInstanceMatrixAttributes(
        attributeFloatValues,
        matrixByteOffset,
        elementSize,
        index,
        boundingBox,
        out
      );
    };

    return V9GeometryFilterer.filterWithCallback(interleavedAttributeMap, computeCallback, clipBox);
  }

  private static filterTrapeziumCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    const computeCallback = (
      index: number,
      elementSize: number,
      attributeFloatValues: Float32Array,
      out: THREE.Box3
    ): THREE.Box3 => {
      const vertex1Attribute = interleavedAttributeMap.get('_vertex1')!;
      const vertex2Attribute = interleavedAttributeMap.get('_vertex2')!;
      const vertex3Attribute = interleavedAttributeMap.get('_vertex3')!;
      const vertex4Attribute = interleavedAttributeMap.get('_vertex4')!;

      const elementByteSize = (vertex1Attribute.array as TypedArray).BYTES_PER_ELEMENT;

      const vertex1AttributeByteOffset = vertex1Attribute.offset * elementByteSize;
      const vertex2AttributeByteOffset = vertex2Attribute.offset * elementByteSize;
      const vertex3AttributeByteOffset = vertex3Attribute.offset * elementByteSize;
      const vertex4AttributeByteOffset = vertex4Attribute.offset * elementByteSize;

      return computeBoundingBoxFromVertexAttributes(
        vertex1AttributeByteOffset,
        vertex2AttributeByteOffset,
        vertex3AttributeByteOffset,
        vertex4AttributeByteOffset,
        attributeFloatValues,
        elementSize,
        index,
        out
      );
    };

    return V9GeometryFilterer.filterWithCallback(interleavedAttributeMap, computeCallback, clipBox);
  }

  private static filterNutCollection(
    interleavedAttributeMap: Map<string, THREE.InterleavedBufferAttribute>,
    clipBox: THREE.Box3
  ): Uint8Array {
    return V9GeometryFilterer.filterOnInstanceMatrixAndBoundingBox(
      interleavedAttributeMap,
      V9GeometryFilterer.unitBoundingBox,
      clipBox
    );
  }
}
