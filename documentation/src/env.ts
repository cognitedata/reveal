function getNumber(arg: string | undefined): number | undefined {
  return typeof arg === 'string' ? parseInt(arg, 10) : arg
}

export const env = {
  project: process.env.PROJECT || 'publicdata',
  modelId: getNumber(process.env.CAD_ID) || 4715379429968321,
  revisionId: getNumber(process.env.CAD_REVISION_ID) || 5688854005909501
  // add some pointclouds here later
}

console.log(env)
