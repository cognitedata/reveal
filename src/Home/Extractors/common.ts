import { Artifact } from './ExtractorDownloadApi';

export const getArtifactName = (artifact: Artifact): string => {
  return artifact.displayName ?? artifact.name;
};
