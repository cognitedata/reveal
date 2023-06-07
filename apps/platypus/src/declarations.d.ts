/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'graphiql-explorer';

declare module '*.json' {
  const value: any;
  export default value;
}
