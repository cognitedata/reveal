import { SidecarConfig } from '@cognite/react-tenant-selector';

export const SIDECAR: SidecarConfig = {
  // eslint-disable-next-line no-underscore-dangle
  ...(window as any).__cogniteSidecar,
} as const;
