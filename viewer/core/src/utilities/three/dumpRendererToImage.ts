/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export async function dumpRendererToImage(
  renderer: THREE.WebGLRenderer,
  renderTarget: THREE.WebGLRenderTarget
): Promise<string> {
  const canvas = new OffscreenCanvas(renderTarget.width, renderTarget.height);
  const context = canvas.getContext('2d')!;
  const imageData = context.createImageData(renderTarget.width, renderTarget.height);

  // Read back result from GPU
  renderer.readRenderTargetPixels(renderTarget, 0, 0, renderTarget.width, renderTarget.height, imageData.data);

  context.putImageData(imageData, 0, 0);
  const blob = await canvas.convertToBlob();

  return new Promise<string>(resolve => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.readAsDataURL(blob);
  });
}
