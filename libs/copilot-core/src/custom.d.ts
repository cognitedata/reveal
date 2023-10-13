/* eslint-disable @typescript-eslint/no-explicit-any */
/** This is the built in way how to load the web workers using webpack is with worker-loader
 * https://v4.webpack.js.org/loaders/worker-loader/#integrating-with-typescript
 * https://v4.webpack.js.org/loaders/worker-loader/#cross-origin-policy
 *
 * We have to use worker-loader and not URL method because of CORS issues
 * https://webpack.js.org/guides/web-workers/
 *
 * Quote:
 * WebWorkers are restricted by a same-origin policy, so if your webpack assets are not being served from the same origin as your application, their download may be blocked by your browser.
 * This scenario can commonly occur if you are hosting your assets under a CDN domain. Even downloads from the webpack-dev-server could be blocked.
 * There are two workarounds:
 * 1. Firstly, you can inline the worker as a blob instead of downloading it as an external script via the inline parameter
 * 2. Secondly, you may override the base download URL for your worker script via the publicPath option
 */
declare module 'worker-loader*' {
  class WebpackWorker extends Worker {
    constructor();
  }

  export = WebpackWorker;
}

declare module '*.json' {
  const value: any;
  export default value;
}
declare module '*.svg' {
  const content: any;
  export default content;
}
