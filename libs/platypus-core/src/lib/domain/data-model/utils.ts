export const getDataModelEndpointUrl = (
  projectName: string,
  dataModelName: string,
  version: string,
  baseUrl: string
) => {
  return `${baseUrl}/api/v1/projects/${projectName}/schema/api/${dataModelName}/${version}/graphql`;
};
