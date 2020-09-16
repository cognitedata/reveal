export type Sidecar = {
  __sidecarFormatVersion: number;
  applicationId: string;
  cognuitApiBaseUrl: string;
  cognuitCdfProject: string;
};

export const SIDECAR: Sidecar = {
  __sidecarFormatVersion: 0,
  applicationId: 'cognuit-dev',
  cognuitApiBaseUrl:
    'https://subsurface-console-cognitedata-development.cognite.ai',
  cognuitCdfProject: 'subsurface-test',
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line no-underscore-dangle
  ...(window as any).__cogniteSidecar,
} as const;
