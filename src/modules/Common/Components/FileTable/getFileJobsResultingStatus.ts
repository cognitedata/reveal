import { JobStatus } from 'src/api/vision/detectionModels/types';

export function getFileJobsResultingStatus(
  jobs: Array<{
    status: JobStatus;
  }>
): JobStatus {
  let { status } = jobs[0];
  for (let i = 1; i < jobs.length; i++) {
    if (jobs[i].status === 'Failed') {
      return 'Failed';
    }
    if (
      jobs[i].status === 'Running' ||
      (jobs[i].status === 'Completed' && status === 'Completed')
    ) {
      status = jobs[i].status;
    }
  }
  return status;
}
