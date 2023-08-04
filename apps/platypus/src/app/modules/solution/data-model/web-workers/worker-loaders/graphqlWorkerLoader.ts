/**  This is the built in way how to load the web workers using webpack is with worker-loader */
// import GraphQLWorker from 'worker-loader?esModule=true&inline=fallback!./graphql.worker';

function getGraphQlWorker() {
  return new Worker(new URL('./graphql.worker', import.meta.url));
}

export { getGraphQlWorker };
