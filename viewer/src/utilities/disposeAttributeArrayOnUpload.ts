/*!
 * Copyright 2020 Cognite AS
 */

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
export function disposeAttributeArrayOnUpload(this: { array: ArrayLike<number> }) {
  (this.array as ArrayLike<number> | null) = null;
}
