/*!
 * Copyright 2021 Cognite AS
 */

import type { TypedArray } from './types';

/**
 * Handler for THREE.BufferAttribute.onUpload() that frees the underlying JS side array
 * of values after they have been uploaded to the GPU.
 *
 * @example
 * const geometry = new THREE.BufferGeometry();
 * const indices = new THREE.Uint32BufferAttribute(mesh.indices.buffer, 1).onUpload(disposeAttributeArrayOnUpload);
 * const vertices = new THREE.Float32BufferAttribute(mesh.vertices.buffer, 3).onUpload(disposeAttributeArrayOnUpload);
 * const colors = new THREE.Float32BufferAttribute(mesh.colors.buffer, 3).onUpload(disposeAttributeArrayOnUpload);
 * const treeIndices = new THREE.Float32BufferAttribute(mesh.treeIndices.buffer, 1).onUpload(disposeAttributeArrayOnUpload);
 */

type TypedArrayCtor = new (length: number) => TypedArray;

type GpuBufferRecord = {
  buffer: WebGLBuffer;
  Ctor: TypedArrayCtor;
  bytesPerElement: number;
};

type UploadAttribute = {
  array: ArrayLike<number> | null;
  itemSize: number;
};

const gpuBuffers = new WeakMap<object, GpuBufferRecord>();
let uploadContext: WebGL2RenderingContext | null = null;

export function bindGpuUploadContext(gl: WebGLRenderingContext | WebGL2RenderingContext | null): void {
  uploadContext = gl !== null && 'getBufferSubData' in gl ? gl : null;
}

export function resetAttributeUploadState(): void {
  uploadContext = null;
}

export function disposeAttributeArrayOnUpload(this: UploadAttribute): void {
  const source = this.array;
  if (!source || source.length === 0 || !isTypedArray(source)) {
    return;
  }

  const gl = uploadContext;
  if (!gl) {
    return;
  }

  let buffer: WebGLBuffer | null = null;
  try {
    buffer = gl.getParameter(gl.ARRAY_BUFFER_BINDING) as WebGLBuffer | null;
  } catch {
    return;
  }

  if (!buffer || typeof buffer !== 'object' || Array.isArray(buffer)) {
    return;
  }

  const Ctor = source.constructor as TypedArrayCtor;
  gpuBuffers.set(this, { buffer, Ctor, bytesPerElement: source.BYTES_PER_ELEMENT });
  this.array = new Ctor(0);
}

export function readAttributeComponents(attribute: UploadAttribute, index: number): TypedArray | undefined {
  const record = gpuBuffers.get(attribute);
  const gl = uploadContext;
  if (!record || !gl) {
    return undefined;
  }

  const item = new record.Ctor(attribute.itemSize);
  const byteOffset = index * attribute.itemSize * record.bytesPerElement;
  let previous: WebGLBuffer | null = null;
  try {
    previous = gl.getParameter(gl.ARRAY_BUFFER_BINDING) as WebGLBuffer | null;
    gl.bindBuffer(gl.ARRAY_BUFFER, record.buffer);
    gl.getBufferSubData(gl.ARRAY_BUFFER, byteOffset, item);
    return item;
  } catch {
    return undefined;
  } finally {
    try {
      gl.bindBuffer(gl.ARRAY_BUFFER, previous);
    } catch {}
  }
}

function isTypedArray(value: ArrayLike<number>): value is TypedArray {
  return typeof (value as TypedArray).BYTES_PER_ELEMENT === 'number';
}
