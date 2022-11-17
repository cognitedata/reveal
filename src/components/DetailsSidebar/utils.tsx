import { getProject, getCluster } from '@cognite/cdf-utilities';
import { units } from 'utils/units';

// TODO(DEGR-836)
export const useFusionLink = (path: string) => {
  const cluster = getCluster();
  const project = getProject();

  return `https://fusion.cognite.com/${project}${path}${
    cluster && `?env=${cluster}`
  }`;
};

export const getDisplayUnit = (
  preferredUnit: string | undefined,
  defaultLabel?: string
) => {
  const unitLabel = units.find(
    (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
  )?.label;

  return unitLabel || preferredUnit || defaultLabel;
};
