/// <reference types="react-app-rewired" />

declare module '*.css';
declare module '*.less';

declare module 'locize';
declare module 'locize-lastused';
declare module '*.svg' {
  const content: any;
  export default content;
}
declare module '*.png' {
  const content: any;
  export default content;
}
