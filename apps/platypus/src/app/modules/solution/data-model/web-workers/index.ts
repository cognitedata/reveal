/**
 * Why all these web workers and why should I care?
 * We are doing many expensive and UI heavy operations on the UI that affects the performance and actual UX.
 * Using web workers to compute heavy stuff outside of the UI thread is the way how this can be fixed.
 * They cost hardly anything in terms of resource overhead and you shouldn't worry too much about them, as long as you get them to work.
 * Monaco-editor also recommends moving everything into web worker and they are doing this for languages that they support:
 * https://github.com/microsoft/monaco-editor/tree/main/src/language
 *
 * All files that are here are used by the worker and integrated into monaco-editor to fix perormance issues and provide better UX.
 * This is standard way how to register and create a language support in monaco-editor.
 *
 *
 * We are providing
 * * monaco-editor - everything here is used by the code editor (monaco editor) in the main thread. It is just a setup for monaco
 *    * graphqlSetup - creates worker, register providers and returns instance with dispose method to clear on unmount
 * * workers-loaders - everything here is related with web workers and how we load them
 *    * graphql.worker - this is the actual web worker file
 *    * WorkerLoader files - those are needed so we can load the web workers using webpack (https://webpack.js.org/guides/web-workers/)
 * * FdmGraphQLDmlWorker - The implementation for the worker extracted as a separate class so it is reused
 * * language-service - a facade used in the web worker for features like code completition, formatting..etc.
 */
export * from './types';
export * from './monaco-editor/graphqlSetup';
