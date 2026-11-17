/*!
 * Copyright 2023 Cognite AS
 */

import type { TypedArray, TypedArrayConstructor } from '@reveal/utilities';
import { assert } from '@reveal/utilities/assert';
import {
  BufferAttribute,
  InterleavedBufferAttribute,
  BufferGeometry,
  InstancedInterleavedBuffer,
  DynamicDrawUsage
} from 'three';

export class GeometryBufferUtils {
  private static readonly TypedArrayViews = new Map<number, TypedArrayConstructor>([
    [1, Uint8Array],
    [4, Float32Array]
  ]);

  public static getAttributes<T extends BufferAttribute | InterleavedBufferAttribute>(
    geometry: BufferGeometry,
    filterType: new (...args: any[]) => T
  ): { name: string; attribute: T }[] {
    return Object.entries(geometry.attributes)
      .filter(namedAttribute => namedAttribute[1] instanceof filterType)
      .map(namedAttribute => {
        return { name: namedAttribute[0], attribute: namedAttribute[1] as T };
      });
  }

  public static copyGeometryWithBufferAttributes(geometry: BufferGeometry): BufferGeometry {
    const newGeometry = new BufferGeometry();

    GeometryBufferUtils.getAttributes(geometry, BufferAttribute).forEach(namedAttribute => {
      newGeometry.setAttribute(namedAttribute.name, namedAttribute.attribute);
    });

    newGeometry.setIndex(geometry.getIndex());

    return newGeometry;
  }

  public static setInstanceAttributeDescriptors(
    instanceAttributes: {
      name: string;
      attribute: InterleavedBufferAttribute;
    }[],
    bufferGeometry: BufferGeometry,
    backingBuffer: ArrayBuffer
  ): void {
    const interleavedBuffersByComponentSize = new Map<number, InstancedInterleavedBuffer>();

    instanceAttributes.forEach(instanceAttribute => {
      const { name, attribute } = instanceAttribute;

      const stride = attribute.data.stride;
      const componentSize = (attribute.array as TypedArray).BYTES_PER_ELEMENT;

      let interleavedAttributesBuffer = interleavedBuffersByComponentSize.get(componentSize);
      if (interleavedAttributesBuffer === undefined) {
        const ComponentType = GeometryBufferUtils.TypedArrayViews.get(componentSize);
        assert(ComponentType !== undefined, `Unsupported component size: ${componentSize}`);
        interleavedAttributesBuffer = new InstancedInterleavedBuffer(new ComponentType(backingBuffer), stride);
        interleavedAttributesBuffer.setUsage(DynamicDrawUsage);
        interleavedBuffersByComponentSize.set(componentSize, interleavedAttributesBuffer);
      }
      assert(
        interleavedAttributesBuffer.stride === stride,
        'Instance attributes with the same component type must share the same stride'
      );

      bufferGeometry.setAttribute(
        name,
        new InterleavedBufferAttribute(
          interleavedAttributesBuffer,
          attribute.itemSize,
          attribute.offset,
          attribute.normalized
        )
      );
    });
  }

  public static getInstanceAttributesSharedView(geometry: BufferGeometry): TypedArray {
    const instanceAttributes = GeometryBufferUtils.getAttributes(geometry, InterleavedBufferAttribute);

    assert(instanceAttributes.length > 0);

    const interleavedBufferView = instanceAttributes[0].attribute.array as TypedArray;

    for (let i = 1; i < instanceAttributes.length; i++) {
      const instanceAttributeBufferView = instanceAttributes[i].attribute.array;
      assert(
        interleavedBufferView.buffer === (instanceAttributeBufferView as TypedArray).buffer,
        'Instance attributes must be interleaved'
      );
    }
    return interleavedBufferView;
  }
}
