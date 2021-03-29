import { JobStatus, AnnotationJob, DetectionModelType } from 'src/api/types';
import { AnnotationStatusAndCount } from '../../types';

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

function getModelBadgeData(jobs: AnnotationJob[]) {
  if (jobs.length) {
    let count = 0;
    jobs.forEach((job) => {
      if ('items' in job && job.items[0].annotations) {
        count += job.items[0].annotations.length;
      }
    });

    const status = getFileJobsResultingStatus(jobs);
    return { status, count };
  }
  return { status: '' as JobStatus, count: undefined };
}

export function getFileJobsStatus(
  jobs: AnnotationJob[]
): AnnotationStatusAndCount {
  if (!jobs.length) {
    return {
      gdprDetctionStatus: { status: '' as JobStatus, count: undefined },
      tagDetctionStatus: { status: '' as JobStatus, count: undefined },
      genericDetctionStatus: {
        status: '' as JobStatus,
        count: undefined,
      },
    };
  }
  const [tag, gdpr, generic] = jobs.reduce(
    // Use "deconstruction" style assignment
    (result, job) => {
      // result[element <= 10 ? 0 : 1].push(element); // Determine and push to small/large arr
      if (job.type === DetectionModelType.Tag) {
        result[0].push(job);
      }
      if (job.type === DetectionModelType.GDPR) {
        result[1].push(job);
      } else {
        result[2].push(job);
      }
      return result;
    },
    [[], [], []] as Array<AnnotationJob>[]
  );

  return {
    gdprDetctionStatus: getModelBadgeData(gdpr),
    tagDetctionStatus: getModelBadgeData(tag),
    genericDetctionStatus: getModelBadgeData(generic),
  };
}
