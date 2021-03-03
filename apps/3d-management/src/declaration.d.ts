declare module '*.png';
declare module '*.jpg';
declare module '*.css';

// https://github.com/ant-design/ant-design/issues/13405
interface ResizeObserver {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

// https://github.com/cognitedata/data-exploration/pull/510/files
declare module '@cognite/cdf-route-tracker' {
  export declare function trackEvent(name: string, options?: any): void;
}
