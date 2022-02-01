import {
  AnnotationsBadgeStatuses,
  AnnotationStatuses,
} from 'src/modules/Common/types';
import { hasJobsFailedForFile } from 'src/modules/Process/processSlice';
import { JobStatus } from 'src/api/types';

describe('Test util hasJobsFailedForFile', () => {
  const mockAnnotationBadgeProps: AnnotationsBadgeStatuses = {
    tag: { status: 'Completed', statusTime: 12323232223, error: '' },
    gdpr: {
      status: 'Failed',
      statusTime: 12323232223,
      error: 'Error Occurred!',
    },
    text: { status: 'Queued', statusTime: 12323232223, error: undefined },
    objects: { status: 'Running', statusTime: 12323232223, error: undefined },
  };

  it('Return return true if one of the jobs has failed without providing error', () => {
    const badgeProps = {
      ...mockAnnotationBadgeProps,
      gdpr: {
        ...mockAnnotationBadgeProps.gdpr,
        error: '',
      } as AnnotationStatuses,
    };

    expect(hasJobsFailedForFile(badgeProps)).toEqual(true);
  });

  it('Return return true if one of the jobs is providing an error', () => {
    const badgeProps = {
      ...mockAnnotationBadgeProps,
      gdpr: {},
      objects: {
        ...mockAnnotationBadgeProps.objects,
        error: 'Error occurred!!',
      } as AnnotationStatuses,
    };

    expect(hasJobsFailedForFile(badgeProps)).toEqual(true);
  });
  it('Return return false if all the jobs is without error', () => {
    const badgeProps = {
      ...mockAnnotationBadgeProps,
      gdpr: {
        ...mockAnnotationBadgeProps.gdpr,
        status: 'Completed' as JobStatus,
        error: '',
      } as AnnotationStatuses,
    };

    expect(hasJobsFailedForFile(badgeProps)).toEqual(false);
  });
});
