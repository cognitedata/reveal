import React from 'react';
import { Dropdown, Menu, Tooltip, Space } from 'antd';
import { Button, Icon } from '@cognite/cogs.js';
import { usePermissions } from 'lib/hooks/CustomHooks';
import { ResourceItem, isModelRunning } from 'lib/types';
import {
  useDeleteFindObjectsJob,
  useFindObjectsJobId,
  useFindObjects,
  useJob,
} from 'lib/hooks/objectDetection';

export const ContextualizationButton = ({
  item: { id, type },
}: {
  item: ResourceItem;
}) => {
  const filesAcl = usePermissions('filesAcl', 'WRITE');
  const eventsAcl = usePermissions('eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;

  const cancel = useDeleteFindObjectsJob();
  const jobId = useFindObjectsJobId(id);
  const [findObjects] = useFindObjects();

  const { data: job } = useJob(jobId);
  const running = !!jobId && isModelRunning(job?.status);
  const runningLabel = running ? 'Cancel' : 'Remove detected objects';

  const start = async () => {
    if (jobId) {
      cancel(id);
    } else {
      findObjects({ fileId: id });
    }
  };

  if (type !== 'file') {
    return null;
  }

  const menu = (
    <Menu>
      <Menu.Item onClick={start}>
        <Space>
          <DetectJobIcon jobId={jobId} />
          <span>{jobId ? runningLabel : 'Detect objects'}</span>
        </Space>
      </Menu.Item>
    </Menu>
  );

  if (!writeAccess) {
    const errors = [];
    if (!filesAcl) {
      errors.push('files:write is missing');
    }
    if (!eventsAcl) {
      errors.push('event:write is missing');
    }
    return (
      <Tooltip
        placement="bottom"
        title={
          <>
            <p>
              You do not have the necessary permissions to edit this file. You
              need both events:write and files:write capabilities.
            </p>
            <p>Errors: {errors.join(' and ')}.</p>
          </>
        }
      >
        <Button variant="outline" icon="LightBulb" disabled />
      </Tooltip>
    );
  }

  return (
    <Dropdown overlay={menu} trigger={['click']} key={id}>
      <Button variant="outline" icon={running ? 'Loading' : 'LightBulb'} />
    </Dropdown>
  );
};

const DetectJobIcon = ({ jobId }: { jobId?: number }) => {
  const { data: job } = useJob(jobId);
  const running = !!jobId && isModelRunning(job?.status);
  if (running) {
    return <Icon type="Loading" />;
  }
  switch (job?.status) {
    case 'Completed':
      return <Icon type="Close" />;
    case 'Failed':
      return <Icon type="Beware" />;
    default:
      return <Icon type="ThreeD" />;
  }
};
