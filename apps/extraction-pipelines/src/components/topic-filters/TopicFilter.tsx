import React from 'react';

import {
  Body,
  Button,
  Colors,
  Dropdown,
  Menu,
  Status,
  StatusProps,
} from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import {
  MQTTJobWithMetrics,
  useDeleteMQTTJob,
  useUpdateMQTTJob,
} from 'hooks/hostedExtractors';
import {
  doesJobStatusHaveErrorType,
  doesJobStatusHaveNeutralType,
  doesJobStatusHaveSuccessType,
} from 'utils/hostedExtractors';

type TopicFilterProps = {
  className?: string;
  job: MQTTJobWithMetrics;
};

const getJobStatusForCogs = (
  job: MQTTJobWithMetrics
): StatusProps['type'] | undefined => {
  if (doesJobStatusHaveErrorType(job)) {
    return 'critical';
  }
  if (doesJobStatusHaveNeutralType(job)) {
    return 'neutral';
  }
  if (doesJobStatusHaveSuccessType(job)) {
    return 'success';
  }
  return undefined;
};

export const TopicFilter = ({
  className,
  job,
}: TopicFilterProps): JSX.Element => {
  const { t } = useTranslation();

  const { mutate: deleteJob } = useDeleteMQTTJob();
  const { mutate: updateJob } = useUpdateMQTTJob();

  const handleDelete = (): void => {
    deleteJob({
      externalId: job.externalId,
    });
  };

  const handleUpdateTargetStatus = (): void => {
    const nextTargetStatus: MQTTJobWithMetrics['targetStatus'] =
      job.targetStatus === 'paused' ? 'running' : 'paused';

    updateJob({
      externalId: job.externalId,
      update: {
        targetStatus: {
          set: nextTargetStatus,
        },
      },
    });
  };

  return (
    <Container className={className}>
      <Body level={2}>{job.topicFilter}</Body>
      <Body level={2}>
        {job.status ? (
          <Status
            text={t(`mqtt-job-status-${job.status}`)}
            type={getJobStatusForCogs(job)}
          />
        ) : (
          '-'
        )}
      </Body>
      <Dropdown
        content={
          <Menu>
            <Menu.Item
              icon={job.targetStatus === 'paused' ? 'Play' : 'Pause'}
              iconPlacement="left"
              onClick={handleUpdateTargetStatus}
            >
              {job.targetStatus === 'paused' ? t('resume') : t('pause')}
            </Menu.Item>
            <Menu.Item
              destructive
              icon="Delete"
              iconPlacement="left"
              onClick={handleDelete}
            >
              {t('delete')}
            </Menu.Item>
          </Menu>
        }
        hideOnSelect={{
          hideOnContentClick: true,
          hideOnOutsideClick: true,
        }}
      >
        <Button icon="EllipsisHorizontal" type="ghost" />
      </Dropdown>
    </Container>
  );
};

const Container = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr 1fr min-content;
  border-bottom: 1px solid ${Colors['border--interactive--disabled']};
  padding: 12px 16px;
`;
