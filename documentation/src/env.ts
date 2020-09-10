function getNumber(arg: string | undefined): number | undefined {
  return typeof arg === 'string' ? parseInt(arg, 10) : arg
}

export const env = {
  project: process.env.PROJECT || 'publicdata',
  modelId: getNumber(process.env.CAD_ID) || 3356984403684032,
  revisionId: getNumber(process.env.CAD_REVISION_ID) || 6664823881595566
  // add some pointclouds here later
}
