/*!
 * Copyright 2021 Cognite AS
 */

// mock 'document'
// https://stackoverflow.com/a/50629802
import { JSDOM } from 'jsdom';

export function createGlContext(width: number, height: number, options?: WebGLContextAttributes) {
  const dom = new JSDOM();
  const { document } = dom.window;

  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context: WebGLRenderingContext = require('gl')(width, height, options);
  Object.defineProperty(context, 'canvas', { get: () => canvas });

  return context;
}
