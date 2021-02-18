export type Sidecar = {
  cognuitCdfProject: string;
  disableTranslations?: boolean;
};

export const SIDECAR: Sidecar = {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  // eslint-disable-next-line no-underscore-dangle
  ...(window as any).__cogniteSidecar,
} as const;
