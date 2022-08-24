import { units } from 'utils/units';
import { useCluster, useProject } from 'hooks/config';

export const useFusionLink = (path: string) => {
  const [cluster] = useCluster();
  const project = useProject();

  return `https://fusion.cognite.com/${project}${path}${
    cluster && `?env=${cluster}`
  }`;
};

export const getDisplayUnit = (
  preferredUnit: string | undefined,
  defaultLabel?: string
) => {
  return (
    (
      units.find(
        (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
      ) || {}
    ).label ||
    preferredUnit ||
    defaultLabel
  );
};
