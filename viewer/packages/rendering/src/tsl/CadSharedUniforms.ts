/*!
 * Copyright 2026 Cognite AS
 */

import type { DataTexture, Matrix4, Texture, Vector3 } from 'three';
import { Matrix4 as Matrix4Class, Vector2, Vector3 as Vector3Class } from 'three';
import { texture, uniform } from 'three/tsl';

import { RenderMode } from '../rendering/RenderMode';

export type CadSharedUniformNodes = {
  renderMode: ReturnType<typeof uniform<'int'>>;
  treeIndexTextureSize: ReturnType<typeof uniform<'vec2'>>;
  transformOverrideTextureSize: ReturnType<typeof uniform<'vec2'>>;
  colorDataTexture: ReturnType<typeof uniform<'texture'>>;
  transformOverrideIndexTexture: ReturnType<typeof uniform<'texture'>>;
  transformOverrideTexture: ReturnType<typeof uniform<'texture'>>;
  matCapTexture: ReturnType<typeof texture>;
  inverseModelMatrix: ReturnType<typeof uniform<'mat4'>>;
  cameraPosition: ReturnType<typeof uniform<'vec3'>>;
};

export function createCadSharedUniformNodes(
  overrideColorPerTreeIndex: DataTexture,
  transformOverrideIndexTexture: DataTexture,
  transformOverrideLookupTexture: DataTexture,
  matCapTexture: Texture,
  renderMode: RenderMode = RenderMode.Color
): CadSharedUniformNodes {
  const treeIndexTextureSize = new Vector2(
    overrideColorPerTreeIndex.image.width,
    overrideColorPerTreeIndex.image.height
  );
  const transformOverrideTextureSize = new Vector2(
    transformOverrideLookupTexture.image.width,
    transformOverrideLookupTexture.image.height
  );

  return {
    renderMode: uniform(renderMode, 'int'),
    treeIndexTextureSize: uniform(treeIndexTextureSize, 'vec2'),
    transformOverrideTextureSize: uniform(transformOverrideTextureSize, 'vec2'),
    colorDataTexture: uniform(overrideColorPerTreeIndex),
    transformOverrideIndexTexture: uniform(transformOverrideIndexTexture),
    transformOverrideTexture: uniform(transformOverrideLookupTexture),
    matCapTexture: texture(matCapTexture),
    inverseModelMatrix: uniform(new Matrix4Class(), 'mat4'),
    cameraPosition: uniform(new Vector3Class(), 'vec3')
  };
}

export function setCadSharedRenderMode(uniforms: CadSharedUniformNodes, renderMode: RenderMode): void {
  uniforms.renderMode.value = renderMode;
}

export function updateCadSharedTextureUniforms(
  uniforms: CadSharedUniformNodes,
  overrideColorPerTreeIndex: DataTexture,
  transformOverrideIndexTexture: DataTexture,
  transformOverrideLookupTexture: DataTexture
): void {
  uniforms.colorDataTexture.value = overrideColorPerTreeIndex;
  uniforms.transformOverrideIndexTexture.value = transformOverrideIndexTexture;
  uniforms.transformOverrideTexture.value = transformOverrideLookupTexture;
  uniforms.treeIndexTextureSize.value.set(
    overrideColorPerTreeIndex.image.width,
    overrideColorPerTreeIndex.image.height
  );
  uniforms.transformOverrideTextureSize.value.set(
    transformOverrideLookupTexture.image.width,
    transformOverrideLookupTexture.image.height
  );
}

export function setInverseModelMatrix(uniforms: CadSharedUniformNodes, matrix: Matrix4): void {
  uniforms.inverseModelMatrix.value.copy(matrix);
}

export function setCameraPosition(uniforms: CadSharedUniformNodes, position: Vector3): void {
  uniforms.cameraPosition.value.copy(position);
}
