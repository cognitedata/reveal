import { SidecarConfig } from '@cognite/sidecar';

export const SIDECAR: SidecarConfig = {
  // eslint-disable-next-line no-underscore-dangle
  ...(window as any).__cogniteSidecar,
} as const;
