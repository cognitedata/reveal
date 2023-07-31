import { SidecarConfig } from '@cognite/sidecar';

export {};

type DotPrefix<T extends string> = T extends '' ? '' : `.${T}`;

declare global {
  interface Window {
    Intercom: any;
    intercomSettings: any;
    attachEvent: any;
    __cogniteSidecar: Partial<SidecarConfig>;
  }

  type DeepKeyOf<T> = (
    T extends object
      ? {
          [K in Exclude<keyof T, symbol>]: `${K}${DotPrefix<DeepKeyOf<T[K]>>}`;
        }[Exclude<keyof T, symbol>]
      : ''
  ) extends infer D
    ? Extract<D, string>
    : never;
}
