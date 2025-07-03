export function createPointCloudModelExternalId(modelId: number): string {
  return `cog_3d_model_${modelId}`;
}

export function createPointCloudRevisionExternalId(revisionId: number): string {
  return `cog_3d_revision_${revisionId}`;
}
