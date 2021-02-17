import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import React, { useEffect, useState } from 'react';
import {
  detectAnnotations,
  pollAnnotationJobStatus,
} from 'src/store/processSlice';
import { PrevNextNav } from 'src/pages/Workflow/components/PrevNextNav';
import { getLink, workflowRoutes } from 'src/pages/Workflow/workflowRoutes';

function useJobsPolling(
  uploadedFiles: RootState['uploadedFiles']['uploadedFiles'],
  jobByFileId: RootState['processSlice']['jobByFileId'],
  pollingInterval: number = 3000
) {
  console.log('usePolling created', uploadedFiles, jobByFileId);
  const dispatch = useDispatch();
  const timerRef = React.useRef<number | undefined>();

  // start() was called outside of the hook
  const pollingStarted = React.useRef<boolean>(false);

  const pollQueuedJobsStatuses = React.useCallback(() => {
    console.log('pollQueuedJobsStatuses', uploadedFiles, jobByFileId);
    uploadedFiles.forEach((file) => {
      const job = jobByFileId[file.id];
      if (!job) {
        console.warn('should never happen. File has no job scheduled', {
          fileId: file.id,
        });
        return;
      }
      const { status } = job;
      if (
        job &&
        !(status === 'COMPLETED' || status === 'FAILED') &&
        job.jobId !== -1 /* fake jobId for optimistic update */
      ) {
        dispatch(pollAnnotationJobStatus(job.jobId));
      }
    });
  }, [uploadedFiles, jobByFileId]);

  const isFinished = uploadedFiles.every((file) => {
    const status = jobByFileId[file.id]?.status;
    return status === 'COMPLETED' || status === 'FAILED';
  });

  // update interval fn with new callback, otherwise it will run the same thing all the time
  useEffect(() => {
    if (pollingStarted.current) {
      stop();
      start();
    }
  }, [pollQueuedJobsStatuses]);

  const start = () => {
    console.log('start', { isFinished });
    pollingStarted.current = true;
    if (!isFinished) {
      timerRef.current = window.setInterval(
        pollQueuedJobsStatuses,
        pollingInterval
      );
    }
  };

  const stop = () => {
    console.log('stop!');
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }
    timerRef.current = undefined;
  };

  if (isFinished) {
    stop();
  }

  return { isFinished, start, stop };
}

export const ProcessStepActionButtons = () => {
  const history = useHistory();
  const { uploadedFiles } = useSelector(
    (state: RootState) => state.uploadedFiles
  );
  const { jobByFileId } = useSelector((state: RootState) => state.processSlice);

  const [detectBtnClicked, setDetectBtnClicked] = useState(false);

  const dispatch = useDispatch();

  const polling = useJobsPolling(uploadedFiles, jobByFileId);

  const onNextClicked = () => {
    if (polling.isFinished) {
      history.push(getLink(workflowRoutes.review));
    } else {
      setDetectBtnClicked(true);
      dispatch(detectAnnotations(uploadedFiles.map((f) => f.id)));
    }
  };

  useEffect(() => {
    if (detectBtnClicked) {
      polling.start();
    } else if (
      uploadedFiles.some(({ id }) => jobByFileId[id]?.status === 'QUEUED')
    ) {
      setDetectBtnClicked(true);
      polling.start();
    }
    return () => {
      polling.stop();
    };
  }, [detectBtnClicked]);

  const titleNext = polling.isFinished ? 'Review' : 'Detect';

  return (
    <PrevNextNav
      onPrevClicked={() => history.push(getLink(workflowRoutes.upload))}
      onNextClicked={onNextClicked}
      titleNext={titleNext}
      disableNext={detectBtnClicked && !polling.isFinished}
    />
  );
};
