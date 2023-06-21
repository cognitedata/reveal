import { JobStatus } from 'src/api/vision/detectionModels/types';
import { getFileJobsResultingStatus } from './getFileJobsResultingStatus';

// FileTable data just needs to show ONE status. If there are multiple jobs,
// then we show something is running or still planned to run
describe('getFileJobsResultingStatus', () => {
  it('returns Running status if some job has it', () => {
    const jobs1: Array<{ status: JobStatus }> = [
      { status: 'Queued' },
      { status: 'Running' },
    ];
    expect(getFileJobsResultingStatus(jobs1)).toBe('Running');

    const jobs2: Array<{ status: JobStatus }> = [
      { status: 'Queued' },
      { status: 'Running' },
      { status: 'Completed' },
    ];
    expect(getFileJobsResultingStatus(jobs2)).toBe('Running');
  });

  it('returns Queued status if its the only status except Completed', () => {
    const jobs: Array<{ status: JobStatus }> = [
      { status: 'Queued' },
      { status: 'Completed' },
    ];
    expect(getFileJobsResultingStatus(jobs)).toBe('Queued');
  });

  it('returns Failed status if any job has that status', () => {
    const jobs: Array<{ status: JobStatus }> = [
      { status: 'Queued' },
      { status: 'Running' },
      { status: 'Failed' },
      { status: 'Completed' },
    ];
    expect(getFileJobsResultingStatus(jobs)).toBe('Failed');
  });

  it('returns Completed if everything is completed without errors', () => {
    const jobs: Array<{ status: JobStatus }> = [
      { status: 'Completed' },
      { status: 'Completed' },
    ];
    expect(getFileJobsResultingStatus(jobs)).toBe('Completed');
  });
});
