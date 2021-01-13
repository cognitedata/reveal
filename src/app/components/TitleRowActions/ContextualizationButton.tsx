import React from 'react';
import { Dropdown, Menu, Tooltip, Space } from 'antd';
import { Button, Icon } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
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
  const { data: filesAcl } = usePermissions('filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions('eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;

  const cancel = useDeleteFindObjectsJob();
  const jobId = useFindObjectsJobId(id);
  const [findObjects] = useFindObjects();

  const { data: job, isError } = useJob(jobId, 'findobjects');

  const running = !isError && !!jobId && isModelRunning(job?.status);
  const label = (() => {
    const failMsg = 'Process failed, click to clear';
    if (isError) {
      return failMsg;
    }
    switch (job?.status) {
      case 'Completed': {
        return 'Remove detected objects';
      }
      case 'Failed': {
        return failMsg;
      }
      case 'New':
      case 'Running':
      case 'Queued':
        return 'Object detection running';
      case undefined:
      default: {
        return 'Detect objects';
      }
    }
  })();
  const icon = (() => {
    if (isError) {
      return 'Beware';
    }
    if (running) {
      return 'Loading';
    }
    switch (job?.status) {
      case 'Completed':
        return 'Close';
      case 'Failed':
        return 'Beware';
      default:
        return 'ThreeD';
    }
  })();

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
          <Icon type={icon} />
          <span>{label}</span>
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
        <Button icon="LightBulb" disabled />
      </Tooltip>
    );
  }

  return (
    <Dropdown overlay={menu} trigger={['click']} key={id}>
      <Tooltip title="Contextualize">
        <Button icon={icon} />
      </Tooltip>
    </Dropdown>
  );
};
