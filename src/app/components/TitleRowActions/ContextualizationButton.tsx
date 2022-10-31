import React from 'react';
import { Button, Dropdown, Flex, Icon, Menu, Tooltip } from '@cognite/cogs.js';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import {
  ResourceItem,
  isModelRunning,
  useDeleteFindObjectsJob,
  useFindObjectsJobId,
  useFindObjects,
  useJob,
} from '@cognite/data-exploration';
import { getFlow } from '@cognite/cdf-sdk-singleton';

export const ContextualizationButton = ({
  item: { id, type },
}: {
  item: ResourceItem;
}) => {
  const { flow } = getFlow();
  const { data: filesAcl } = usePermissions(flow, 'filesAcl', 'WRITE');
  const { data: eventsAcl } = usePermissions(flow, 'eventsAcl', 'WRITE');
  const writeAccess = filesAcl && eventsAcl;

  const cancel = useDeleteFindObjectsJob();
  const jobId = useFindObjectsJobId(id);
  const { mutateAsync: findObjects } = useFindObjects();

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
      return 'WarningFilled';
    }
    if (running) {
      return 'Loader';
    }
    switch (job?.status) {
      case 'Completed':
        return 'Close';
      case 'Failed':
        return 'WarningFilled';
      default:
        return 'Cube';
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
        <Flex>
          <Icon type={icon} />
          <span>{label}</span>
        </Flex>
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
        content={
          <>
            <p>
              You do not have the necessary permissions to edit this file. You
              need both events:write and files:write capabilities.
            </p>
            <p>Errors: {errors.join(' and ')}.</p>
          </>
        }
      >
        <Button icon="LightBulb" aria-label="Warning" disabled />
      </Tooltip>
    );
  }

  return (
    <Tooltip content="Contextualize">
      <Dropdown content={menu} openOnHover={false} key={id}>
        <Button icon={icon} aria-label="Contextualize" />
      </Dropdown>
    </Tooltip>
  );
};
