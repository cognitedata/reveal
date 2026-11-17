/*!
 * Copyright 2026 Cognite AS
 */
import { BufferGeometry, InstancedInterleavedBuffer, InterleavedBuffer, InterleavedBufferAttribute } from 'three';
import { assert } from '@reveal/utilities/assert';
import { GeometryBufferUtils } from './GeometryBufferUtils';

describe(GeometryBufferUtils.name, () => {
  describe('setInstanceAttributeDescriptors()', () => {
    const backingBuffer = new ArrayBuffer(64);

    function getInstanceAttribute(geometry: BufferGeometry, name: string): InterleavedBufferAttribute {
      const attribute = geometry.getAttribute(name);
      assert(attribute instanceof InterleavedBufferAttribute);
      return attribute;
    }

    test('shares one instanced interleaved buffer between attributes of the same component type', () => {
      const source = new InterleavedBuffer(new Float32Array(6), 3);
      const geometry = new BufferGeometry();

      GeometryBufferUtils.setInstanceAttributeDescriptors(
        [
          { name: 'first', attribute: new InterleavedBufferAttribute(source, 1, 0) },
          { name: 'second', attribute: new InterleavedBufferAttribute(source, 2, 1) }
        ],
        geometry,
        backingBuffer
      );

      const first = getInstanceAttribute(geometry, 'first');
      const second = getInstanceAttribute(geometry, 'second');
      expect(first.data).toBeInstanceOf(InstancedInterleavedBuffer);
      expect(second.data).toBe(first.data);
      expect(first.data.array.buffer).toBe(backingBuffer);
      expect(first.data.stride).toBe(source.stride);
    });

    test('uses a separate interleaved buffer for each component type', () => {
      const floats = new InterleavedBuffer(new Float32Array(6), 3);
      const bytes = new InterleavedBuffer(new Uint8Array(8), 4);
      const geometry = new BufferGeometry();

      GeometryBufferUtils.setInstanceAttributeDescriptors(
        [
          { name: 'position', attribute: new InterleavedBufferAttribute(floats, 3, 0) },
          { name: 'color', attribute: new InterleavedBufferAttribute(bytes, 4, 0) }
        ],
        geometry,
        backingBuffer
      );

      const position = getInstanceAttribute(geometry, 'position');
      const color = getInstanceAttribute(geometry, 'color');
      expect(position.data).not.toBe(color.data);
      expect(position.data.array).toBeInstanceOf(Float32Array);
      expect(color.data.array).toBeInstanceOf(Uint8Array);
    });

    test('keeps the item size, offset and normalization of the source attributes', () => {
      const source = new InterleavedBuffer(new Float32Array(6), 3);
      const geometry = new BufferGeometry();

      GeometryBufferUtils.setInstanceAttributeDescriptors(
        [{ name: 'second', attribute: new InterleavedBufferAttribute(source, 2, 1, true) }],
        geometry,
        backingBuffer
      );

      const second = getInstanceAttribute(geometry, 'second');
      expect(second.itemSize).toBe(2);
      expect(second.offset).toBe(1);
      expect(second.normalized).toBe(true);
    });

    test('throws for a component type that is not supported', () => {
      const source = new InterleavedBuffer(new Uint16Array(4), 2);

      expect(() =>
        GeometryBufferUtils.setInstanceAttributeDescriptors(
          [{ name: 'first', attribute: new InterleavedBufferAttribute(source, 1, 0) }],
          new BufferGeometry(),
          backingBuffer
        )
      ).toThrow();
    });

    test('throws when attributes of the same component type have different strides', () => {
      const firstSource = new InterleavedBuffer(new Float32Array(6), 3);
      const secondSource = new InterleavedBuffer(new Float32Array(8), 4);

      expect(() =>
        GeometryBufferUtils.setInstanceAttributeDescriptors(
          [
            { name: 'first', attribute: new InterleavedBufferAttribute(firstSource, 1, 0) },
            { name: 'second', attribute: new InterleavedBufferAttribute(secondSource, 1, 0) }
          ],
          new BufferGeometry(),
          backingBuffer
        )
      ).toThrow();
    });
  });
});
