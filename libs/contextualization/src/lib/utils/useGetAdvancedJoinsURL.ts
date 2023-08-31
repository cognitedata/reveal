import { useParams } from 'react-router';

import { getProject } from '@cognite/cdf-utilities';

import { CONTEXTUALIZATION_MAIN_ROUTE } from '../constants';
import { useSelectedDataModelVersion } from '../hooks/data-model-version/useSelectedDataModelVersion';

import { getUrlParameters } from './getUrlParameters';

/**
 * Generates the URL for Advanced Joins based on the provided parameters.
 * @param headerName Selected column header name.
 * @param dataModelType Type of the selected column.
 * @returns URL for Advanced Joins.
 */
export const useGetAdvancedJoinsURL = (
  headerName: string,
  dataModelType: string
) => {
  const currentURL = window.location.href;
  const baseUrl = new URL(currentURL).origin;

  const project = getProject();

  const { cluster, env, type } = getUrlParameters();

  const { space = '', dataModelExternalId = '', version = '' } = useParams();

  const {
    dataModelVersion: { version: versionNumber },
  } = useSelectedDataModelVersion(version, dataModelExternalId, space);

  const queryParams = new URLSearchParams({
    cluster,
    env,
    space,
    dataModelExternalId,
    versionNumber,
    type,
    headerName,
    dataModelType,
  });

  return `${baseUrl}/${project}/${CONTEXTUALIZATION_MAIN_ROUTE}?${queryParams.toString()}`;
};
