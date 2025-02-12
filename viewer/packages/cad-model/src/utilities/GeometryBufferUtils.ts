/*!
 * Copyright 2023 Cognite AS
 */

import { TypedArray, TypedArrayConstructor } from '@reveal/utilities';
import assert from 'assert';
import {
  BufferAttribute,
  InterleavedBufferAttribute,
  BufferGeometry,
  InstancedInterleavedBuffer,
  DynamicDrawUsage
} from 'three';

export class GeometryBufferUtils {
  private static readonly TypedArrayViews = new Map<number, TypedArrayConstructor>([
    [1, Uint8Array<ArrayBuffer>],
    [4, Float32Array<ArrayBuffer>]
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
    instanceAttributes.forEach(instanceAttribute => {
      const { name, attribute } = instanceAttribute;

      const stride = attribute.data.stride;
      const componentSize = (attribute.array as TypedArray).BYTES_PER_ELEMENT;

      const ComponentType = GeometryBufferUtils.TypedArrayViews.get(componentSize)!;
      const interleavedAttributesBuffer = new InstancedInterleavedBuffer(new ComponentType(backingBuffer), stride);
      interleavedAttributesBuffer.setUsage(DynamicDrawUsage);

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

  public static getInstanceAttributesSharedView(geometry: BufferGeometry): TypedArray<ArrayBuffer> {
    const instanceAttributes = GeometryBufferUtils.getAttributes(geometry, InterleavedBufferAttribute);

    assert(instanceAttributes.length > 0);

    const interleavedBufferView = instanceAttributes[0].attribute.array as TypedArray<ArrayBuffer>;

    for (let i = 1; i < instanceAttributes.length; i++) {
      const instanceAttributeBufferView = instanceAttributes[i].attribute.array;
      assert(
        interleavedBufferView.buffer === (instanceAttributeBufferView as TypedArray<ArrayBuffer>).buffer,
        'Instance attributes must be interleaved'
      );
    }
    return interleavedBufferView;
  }
}
