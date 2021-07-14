import { getProject } from 'hooks';
import { useCluster } from 'config';

export const useFusionLink = (path: string) => {
  const [cluster] = useCluster();

  return `https://fusion.cognite.com/${getProject()}${path}${
    cluster && `?env=${cluster}`
  }`;
};
