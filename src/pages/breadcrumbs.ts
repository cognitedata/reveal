export default function breadcrumbs(mountedAt: string) {
  return {
    [`${mountedAt}/pipeline`]: ['Select files'],
    [`${mountedAt}/pipeline/:filesDataKitId`]: ['Select resources'],
    [`${mountedAt}/pipeline:filesDataKitId/:assetsDataKitId`]: [
      'P&ID configuration',
    ],
    [`${mountedAt}/pipeline/:filesDataKitId/:assetsDataKitId/:optionsId`]: [
      'Review results',
    ],
    [`${mountedAt}/pipeline/:filesDataKitId/:assetsDataKitId/:optionsId/pnid/:fileId`]: [
      'Review a file',
    ],
  };
}
