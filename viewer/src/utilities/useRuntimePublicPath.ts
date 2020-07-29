/*!
 * Copyright 2020 Cognite AS
 */

const globalObj = typeof self !== 'undefined' ? self : window;

// @ts-ignore
if (globalObj.publicPath) {
  console.log('publicPath found in', globalObj);
  if (globalObj === window) {
    // @ts-ignore
    globalObj.originalRevealPublicPath = __webpack_public_path__;
  }
  __webpack_public_path__ = globalObj.publicPath;
}

console.log(
  'useRuntimemodule. __webpack_public_path__ = ',
  __webpack_public_path__,
  'globalObj.publicPath',
  globalObj.publicPath,
  'globalObj',
  globalObj
);

export {};
