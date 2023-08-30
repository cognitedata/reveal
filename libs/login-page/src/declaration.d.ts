/// <reference types="vite/client" />

declare module '*.png';
declare module '*.jpg';
declare module '*.css';
declare module '*.less';
declare module '*.woff2';

declare module '@cognite/cdf-route-tracker' {
  export declare function trackEvent(name: string, options?: unknown): void;
}
