import { JobStatus, AnnotationJob, DetectionModelType } from 'src/api/types';
import { AnnotationsBadgeProps } from 'src/pages/Workflow/types';

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

function getModelBadgeData(jobs: AnnotationJob[], fileId: number) {
  if (jobs.length) {
    let modelGenerated = 0;
    jobs.forEach((job) => {
      if ('items' in job) {
        const annotations = job.items.find((x) => x.fileId === fileId)
          ?.annotations;
        modelGenerated += annotations?.length || 0;
      }
    });

    const status = getFileJobsResultingStatus(jobs);
    return { status, modelGenerated };
  }
  return {};
}

export function getFileJobsStatus(
  jobs: AnnotationJob[],
  fileId: number
): AnnotationsBadgeProps {
  if (!jobs.length) {
    return {
      gdpr: {},
      tag: {},
      textAndObjects: {},
    };
  }
  const [tag, gdpr, generic] = jobs.reduce(
    (result, job) => {
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
    gdpr: getModelBadgeData(gdpr, fileId),
    tag: getModelBadgeData(tag, fileId),
    textAndObjects: getModelBadgeData(generic, fileId),
  };
}
