/*!
 * Copyright 2022 Cognite AS
 */
// Adopted from https://github.com/zalo/TetSim/commit/9696c2e1cd6354fb9bd40dbd299c58f4de0341dd
// (See also https://github.com/mrdoob/three.js/issues/22779)

import * as THREE from 'three';

function clientWaitAsync(gl: WebGL2RenderingContext, sync: WebGLSync, flags: number, interval_ms: number) {
  return new Promise<void>((resolve, reject) => {
    function test() {
      const res = gl.clientWaitSync(sync, flags, 0);
      if (res == gl.WAIT_FAILED) {
        reject();
        return;
      }
      if (res == gl.TIMEOUT_EXPIRED) {
        setTimeout(test, interval_ms);
        return;
      }
      resolve();
    }
    test();
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

  await clientWaitAsync(gl, sync, 0, 10);
  gl.deleteSync(sync);

  gl.bindBuffer(target, buffer);
  gl.getBufferSubData(target, srcByteOffset, dstBuffer, dstOffset, length);
  gl.bindBuffer(target, null);
}

export async function readPixelsAsync(
  gl: WebGL2RenderingContext,
  x: number,
  y: number,
  w: number,
  h: number,
  format: number,
  type: number,
  dest: ArrayBufferView
): Promise<void> {
  const buf = gl.createBuffer();
  if (buf === null) {
    throw new Error('readPixelsAsync() failed because createBuffer() returned null');
  }
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, buf);
  gl.bufferData(gl.PIXEL_PACK_BUFFER, dest.byteLength, gl.STREAM_READ);
  gl.readPixels(x, y, w, h, format, type, 0);
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);

  await getBufferSubDataAsync(gl, gl.PIXEL_PACK_BUFFER, buf, 0, dest);

  gl.deleteBuffer(buf);
}

export async function readPixelsFromTargetAsync(
  renderer: THREE.WebGLRenderer,
  renderTarget: THREE.WebGLRenderTarget,
  x: number,
  y: number,
  w: number,
  h: number,
  dest: ArrayBufferView
): Promise<void> {
  if (renderer.capabilities.isWebGL2) {
    const gl = renderer.context as WebGL2RenderingContext;
    const texture = renderTarget.texture;
    return readPixelsAsync(gl, x, y, w, h, texture.format, texture.type, dest);
  }
  renderer.readRenderTargetPixels(renderTarget, x, y, w, h, dest);
}
