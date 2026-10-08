/*!
 * Copyright 2026 Cognite AS
 */

import {
  bindGpuUploadContext,
  disposeAttributeArrayOnUpload,
  readAttributeComponents,
  resetAttributeUploadState
} from './disposeAttributeArrayOnUpload';

describe(disposeAttributeArrayOnUpload.name, () => {
  afterEach(() => {
    resetAttributeUploadState();
  });

  test('drops the CPU array after upload and reads one point back from the GPU buffer', () => {
    const data = new Float32Array([1, 2, 3, 4, 5, 6]);
    const buffer = {} as WebGLBuffer;
    let bound: WebGLBuffer | null = buffer;
    const gl = {
      ARRAY_BUFFER: 0x8892,
      ARRAY_BUFFER_BINDING: 0x8894,
      getParameter: () => bound,
      bindBuffer: (_target: number, next: WebGLBuffer | null) => {
        bound = next;
      },
      getBufferSubData: (_target: number, offset: number, dest: ArrayBufferView) => {
        const bytes = new Uint8Array(data.buffer, data.byteOffset + offset, dest.byteLength);
        new Uint8Array(dest.buffer, dest.byteOffset, dest.byteLength).set(bytes);
      }
    };

    bindGpuUploadContext(gl as unknown as WebGL2RenderingContext);

    const attribute = { array: data as Float32Array, itemSize: 3, count: 2 };
    disposeAttributeArrayOnUpload.call(attribute);

    expect(data).toHaveLength(6);
    expect(attribute.array).toHaveLength(0);
    expect(attribute.count).toBe(2);
    expect(Array.from(readAttributeComponents(attribute, 1) ?? [])).toEqual([4, 5, 6]);
    expect(bound).toBe(buffer);
  });

  test('keeps the CPU array when the upload buffer cannot be read back', () => {
    const data = new Float32Array([1, 2, 3]);
    const attribute = { array: data, itemSize: 3, count: 1 };

    disposeAttributeArrayOnUpload.call(attribute);

    expect(attribute.array).toBe(data);
  });
});
