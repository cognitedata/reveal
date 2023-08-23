import { getUrlParameters } from '@fusion/contextualization';

export const getDataManagementURL = () => {
  const { dataModel, space, versionNumber, type } = getUrlParameters();

  const queryParams = new URLSearchParams({
    type: type,
  });
  const dataManagementURL = `https://localhost:3000/platypus/data-models/${dataModel}/${space}/${versionNumber}/data-management/preview?${queryParams.toString()}`;
  return dataManagementURL;
};
