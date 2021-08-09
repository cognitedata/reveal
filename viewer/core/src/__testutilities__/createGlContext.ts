/*!
 * Copyright 2021 Cognite AS
 */

// mock 'document'
// https://stackoverflow.com/a/50629802
import { JSDOM } from 'jsdom';

export function createGlContext(width: number, height: number, options?: WebGLContextAttributes) {
  // Override console.warn and eat warnings from THREE.WebGLRenderer about missing extensions
  const consoleWarn = console.warn;
  console.warn = (...data: any[]) => {
    if (
      `${data[0]}`.indexOf('THREE.WebGLRenderer: WebGLMultisampleRenderTarget can only be used with WebGL2.') === -1
    ) {
      consoleWarn(data);
    }
  };

  const dom = new JSDOM();
  const { document } = dom.window;

  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context: WebGLRenderingContext = require('gl')(width, height, options);
  Object.defineProperty(context, 'canvas', { get: () => canvas });

  return context;
}
