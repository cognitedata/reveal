import React from 'react';
import { Menu } from '@cognite/cogs.js';
import {
  useDeleteFindObjectsJob,
  useFindObjectsJobId,
  useFindObjects,
  useJob,
} from 'lib/hooks/objectDetection';
import { isModelRunning } from 'lib/types';
import DetectJobIcon from './DetectJobIcon';

export const DetectObjectsMenuItem = ({ fileId }: { fileId: number }) => {
  const cancel = useDeleteFindObjectsJob();
  const jobId = useFindObjectsJobId(fileId);
  const [findObjects] = useFindObjects();

  const { data: job } = useJob(jobId);
  const running = !!jobId && isModelRunning(job?.status);
  const runningLabel = running ? 'Cancel' : 'Remove detected objects';

  const start = async () => {
    if (jobId) {
      cancel(fileId);
    } else {
      findObjects({ fileId });
    }
  };

  return (
    <Menu.Item disabled={running} onClick={() => start()}>
      <DetectJobIcon jobId={jobId} />
      <span>{jobId ? runningLabel : 'Detect objects'}</span>
    </Menu.Item>
  );
};
export default DetectObjectsMenuItem;
