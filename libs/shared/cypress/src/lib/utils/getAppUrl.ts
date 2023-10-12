export function getAppUrl(
  baseUrl: string,
  project: string,
  app: string,
  cluster: string
): string {
  return `${baseUrl}/${project}/${app}?cluster=${cluster}`;
}
