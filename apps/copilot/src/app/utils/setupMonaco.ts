/* eslint-disable import/no-webpack-loader-syntax */

import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
/**  This is the built in way how to load the web workers using webpack is with worker-loader */
import { Environment as MonacoEditorEnvironment } from 'monaco-editor';
/**  This is the built in way how to load the web workers using webpack is with worker-loader */
function getMonacoEditorWorker() {
  return new Worker(
    new URL(
      'monaco-editor/esm/vs/editor/editor.worker?worker',
      import.meta.url
    ),
    {
      type: 'module',
    }
  );
}

// point here so the context can be used
declare const self: any;

(self as any).MonacoEnvironment = {
  getWorker(_: string, _label: string) {
    // otherwise, load the default web worker from monaco
    return getMonacoEditorWorker();
  },
} as MonacoEditorEnvironment;

loader.config({ monaco });
