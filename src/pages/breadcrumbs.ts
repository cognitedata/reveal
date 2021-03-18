export default function breadcrumbs(mountedAt: string) {
  return {
    [`${mountedAt}`]: ['Select files'],
    [`${mountedAt}/:filesDataKitId`]: ['Select resources'],
    [`${mountedAt}/:filesDataKitId/:assetsDataKitId`]: ['P&ID configuration'],
    [`${mountedAt}/:filesDataKitId/:assetsDataKitId/:optionsId`]: [
      'Review results',
    ],
    [`${mountedAt}/:filesDataKitId/:assetsDataKitId/:optionsId/pnid/:fileId`]: [
      'Review a file',
    ],
  };
}
