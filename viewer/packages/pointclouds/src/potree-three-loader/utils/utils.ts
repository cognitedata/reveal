import { BufferGeometry, Camera, Material, Scene, WebGLRenderer } from 'three';
import { PointCloudMaterial } from '@reveal/rendering';
import { IPointCloudTreeNode } from '../tree/IPointCloudTreeNode';
import { IPointCloudTreeNodeBase } from '../tree/IPointCloudTreeNodeBase';

export function getIndexFromName(name: string): number {
  return parseInt(name.charAt(name.length - 1), 10);
}

/**
 * When passed to `[].sort`, sorts the array by level and index: r, r0, r3, r4, r01, r07, r30, ...
 */
export function byLevelAndIndex(a: IPointCloudTreeNodeBase, b: IPointCloudTreeNodeBase): number {
  const na = a.name;
  const nb = b.name;
  if (na.length !== nb.length) {
    return na.length - nb.length;
  } else if (na < nb) {
    return -1;
  } else if (na > nb) {
    return 1;
  } else {
    return 0;
  }
}

export function handleFailedRequest(response: Response): Response {
  if (response.status !== 200) {
    throw Error('Response error');
  }
  return response;
}

export function handleEmptyBuffer(buffer: ArrayBuffer): ArrayBuffer {
  if (!buffer || buffer.byteLength === 0) {
    throw Error('Empty buffer');
  }
  return buffer;
}

export function createVisibilityTextureData(
  nodes: IPointCloudTreeNodeBase[],
  visibleNodeTextureOffsets: Map<string, number>
): Uint8Array {
  nodes.sort(byLevelAndIndex);

  const data = new Uint8Array(nodes.length * 4);
  const offsetsToChild = new Array(nodes.length).fill(Infinity);

  visibleNodeTextureOffsets.clear();

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    visibleNodeTextureOffsets.set(node.name, i);

    if (i > 0) {
      const parentName = node.name.slice(0, -1);
      const parentOffset = visibleNodeTextureOffsets.get(parentName)!;
      const parentOffsetToChild = i - parentOffset;

      offsetsToChild[parentOffset] = Math.min(offsetsToChild[parentOffset], parentOffsetToChild);

      const offset = parentOffset * 4;
      data[offset] = data[offset] | (1 << node.index);
      data[offset + 1] = offsetsToChild[parentOffset] >> 8;
      data[offset + 2] = offsetsToChild[parentOffset] % 256;
    }

    data[i * 4 + 3] = node.name.length;
  }

  return data;
}

export function makeOnBeforeRender(
  node: IPointCloudTreeNode,
  pcIndex: number
): (renderer: WebGLRenderer, scene: Scene, camera: Camera, bufferGeometry: BufferGeometry, material: Material) => void {
  return (renderer: WebGLRenderer, _scene: Scene, _camera: Camera, _geometry: BufferGeometry, material: Material) => {
    const pointCloudMaterial = material as PointCloudMaterial;
    pointCloudMaterial.onBeforeRender(renderer);
    const materialUniforms = pointCloudMaterial.uniforms;

    materialUniforms.level.value = node.level;
    materialUniforms.isLeafNode.value = node.isLeafNode;

    const vnStart = pointCloudMaterial.visibleNodeTextureOffsets.get(node.name);
    if (vnStart !== undefined) {
      materialUniforms.vnStart.value = vnStart;
    }

    materialUniforms.pcIndex.value = pcIndex;

    // Note: when changing uniforms in onBeforeRender, the flag uniformsNeedUpdate has to be
    // set to true to instruct ThreeJS to upload them. See also
    // https://github.com/mrdoob/three.js/issues/9870#issuecomment-368750182.

    pointCloudMaterial.uniformsNeedUpdate = true;
  };
}
