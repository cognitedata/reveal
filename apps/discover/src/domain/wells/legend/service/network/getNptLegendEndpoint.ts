import { SIDECAR } from 'constants/app';

import { WellLegendNptType } from '../../internal/types';

export const getNptLegendEndpoint = (
  project: string,
  type: WellLegendNptType,
  id?: string
) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/well/legend/npt/${type}${
    id ? `/${id}` : ''
  }`;
