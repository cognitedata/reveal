export default function datasetLink(project: string, datasetId?: number) {
  return datasetId
    ? `https://fusion.cognite.com/${project}/data-sets/data-set/${datasetId}`
    : '';
}
