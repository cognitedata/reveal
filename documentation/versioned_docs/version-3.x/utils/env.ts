function getNumber(arg: string | undefined): number | undefined {
  return typeof arg === 'string' ? parseInt(arg, 10) : arg
}

export const env = {
  project: process.env.PROJECT || 'publicdata',
  cad: {
    modelId: getNumber(process.env.CAD_ID) || 3356984403684032,
    revisionId: getNumber(process.env.CAD_REVISION_ID) || 6664823881595566,
  },
  pointCloud: {
    modelId: getNumber(process.env.POINTCLOUD_ID) || 5564365369975452,
    revisionId: getNumber(process.env.POINTCLOUD_REVISION_ID) || 2817572261344477
  }
}
