declare module '*.css';
declare module '*.less';

declare module 'locize';
declare module '*.svg' {
  const content: any;
  export default content;
}
declare module '*.png' {
  const content: any;
  export default content;
}
declare module '@cognite/gcs-browser-upload';
