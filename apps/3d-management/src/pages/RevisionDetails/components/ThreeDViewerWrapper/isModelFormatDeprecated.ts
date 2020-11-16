import { v3, v3Client } from '@cognite/cdf-sdk-singleton';

/**
 * @param modelId
 * @param revisionId
 * @returns true for deprecated model outputs
 */
export async function isModelFormatDeprecated(
  modelId: number,
  revisionId: number
): Promise<boolean> {
  const revision: v3.RevealRevision3D = await v3Client!.viewer3D.retrieveRevealRevision3D(
    modelId,
    revisionId
  );

  if (revision.sceneThreedFiles === undefined) {
    return false; // it is a point cloud model
  }

  if (revision.sceneThreedFiles.length > 0) {
    const { version } = getNewestVersionedFile(revision.sceneThreedFiles);
    return version < 4;
  }

  return true;
}

// from @cognite/3d-viewer -> Cognite3DModelLoader
function getNewestVersionedFile(
  files: v3.Versioned3DFile[]
): v3.Versioned3DFile {
  const supportedVersions = [1, 2, 3, 7];
  return files
    .filter((file) => supportedVersions.includes(file.version))
    .reduce(
      (newestFile, file) =>
        file.version > newestFile.version ? file : newestFile,
      {
        fileId: -1,
        version: -1,
      }
    );
}
