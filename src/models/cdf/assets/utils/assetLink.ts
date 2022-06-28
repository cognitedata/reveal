export default function assetLink(project: string, assetId?: number) {
  return assetId
    ? `https://fusion.cognite.com/${project}/explore/asset/${assetId}`
    : '';
}
