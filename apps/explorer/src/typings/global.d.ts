import { SidecarConfig } from '@cognite/sidecar';

export {};
declare global {
  interface Window {
    Intercom: any;
    intercomSettings: any;
    attachEvent: any;
    __cogniteSidecar: Partial<SidecarConfig>;
  }

  type NonEmptyArr<T> = [T, ...T[]];
}
