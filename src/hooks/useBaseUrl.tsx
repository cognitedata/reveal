import { getProject } from '@cognite/cdf-utilities';

export const useProjectUrl = () => {
  const project = getProject();

  return project;
};

export const useBaseUrl = () => {
  const projectUrl = useProjectUrl();
  return `/${projectUrl}/documents`;
};
