/* eslint-disable import/no-webpack-loader-syntax */

/**  This is the built in way how to load the web workers using webpack is with worker-loader */
// import SuggestionsWorker from 'worker-loader?esModule=true&inline=fallback!./suggestions.worker';
// export default SuggestionsWorker;

function getSuggestionsWorker() {
  return new Worker(new URL('./suggestions.worker', import.meta.url), {
    type: 'module',
  });
}

export { getSuggestionsWorker };
