/*!
 * Copyright 2022 Cognite AS
 */
// Adopted from https://github.com/zalo/TetSim/commit/9696c2e1cd6354fb9bd40dbd299c58f4de0341dd
// (See also https://github.com/mrdoob/three.js/issues/22779)

import * as THREE from 'three';

function clientWaitAsync(gl: WebGL2RenderingContext, sync: WebGLSync, flags: number, interval_ms: number) {
  return new Promise<void>((resolve, reject) => {
    function checkFence() {
      const res = gl.clientWaitSync(sync, flags, 0);
      switch (res) {
        case gl.TIMEOUT_EXPIRED:
          setTimeout(checkFence, interval_ms); // Check in a while
          break;
        case gl.WAIT_FAILED:
          reject();
          break;
        default:
          resolve();
      }
    }
    checkFence();
  });
}

async function getBufferSubDataAsync(
  gl: WebGL2RenderingContext,
  target: number,
  buffer: WebGLBuffer,
  srcByteOffset: number,
  dstBuffer: ArrayBufferView,
  dstOffset?: number,
  length?: number
) {
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  if (sync === null) {
    throw new Error(`fenceSync() unexpectedly returned null`);
  }
  gl.flush();

  try {
    await clientWaitAsync(gl, sync, 0, 10);
    gl.bindBuffer(target, buffer);
    gl.getBufferSubData(target, srcByteOffset, dstBuffer, dstOffset, length);
    gl.bindBuffer(target, null);
  } finally {
    gl.deleteSync(sync);
  }
}

/**
 * Does the same as THREE.WebGlRenderer.readRenderTargetPixels(), but does this
 * asynchronously when used on WebGL2.
 * @param renderer
 * @param renderTarget
 * @param x
 * @param y
 * @param w
 * @param h
 * @param dest
 * @returns
 */
export async function readPixelsFromTargetAsync(
  renderer: THREE.WebGLRenderer,
  renderTarget: THREE.WebGLRenderTarget,
  x: number,
  y: number,
  w: number,
  h: number,
  dest: ArrayBufferView,
  forceSync = false
): Promise<void> {
  if (renderer.capabilities.isWebGL2 && !forceSync) {
    renderer.readRenderTargetPixelsAsync(renderTarget, x, y, w, h, new Float32Array(dest.buffer));
  }
  renderer.readRenderTargetPixels(renderTarget, x, y, w, h, new Float32Array(dest.buffer));
}
