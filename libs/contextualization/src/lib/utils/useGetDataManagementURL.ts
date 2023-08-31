import { getProject } from '@cognite/cdf-utilities';

import { DATA_MODELS_MAIN_ROUTE } from '../constants';

import { getUrlParameters } from './getUrlParameters';

/**
 * Generates a URL for data management preview based on the current URL parameters and project details.
 * @returns {string} The URL for data management preview.
 */
export const useGetDataManagementURL = () => {
  const currentURL = window.location.href;
  const baseUrl = new URL(currentURL).origin;
  const project = getProject();

  const { cluster, env, dataModelExternalId, space, versionNumber, type } =
    getUrlParameters();

  const queryParams = new URLSearchParams({
    cluster,
    env,
    type: type,
  });

  return `${baseUrl}/${project}/${DATA_MODELS_MAIN_ROUTE}/${space}/${dataModelExternalId}/${versionNumber}/data-management/preview?${queryParams.toString()}`;
};
