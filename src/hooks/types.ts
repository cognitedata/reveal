export const IN_PROGRESS_EM_STATES: JobStatus[] = ['Queued', 'Running'];

export type JobStatus = 'Queued' | 'Running' | 'Completed' | 'Failed';
