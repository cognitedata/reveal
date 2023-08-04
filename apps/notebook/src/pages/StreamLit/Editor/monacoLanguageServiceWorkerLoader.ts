/* eslint-disable import/no-webpack-loader-syntax */

/**  This is the built in way how to load the web workers using webpack is with worker-loader */
// import MonacoEditorWorker from 'worker-loader?esModule=true&inline=fallback!monaco-editor/esm/vs/editor/editor.worker?worker';
// export default MonacoEditorWorker;

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

export { getMonacoEditorWorker };
