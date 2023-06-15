export const IN_PROGRESS_EM_STATES: JobStatus[] = ['Queued', 'Running'];

export type JobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';

export type AssetIdUpdate = {
  id: number;
  update: {
    assetId: { set: number };
  };
};
