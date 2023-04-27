import React from 'react';

import {
  Body,
  Button,
  Colors,
  Dropdown,
  Menu,
  formatDate,
} from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import { MQTTJobWithMetrics, useDeleteMQTTJob } from 'hooks/hostedExtractors';

type TopicFilterProps = {
  className?: string;
  job: MQTTJobWithMetrics;
};

export const TopicFilter = ({
  className,
  job,
}: TopicFilterProps): JSX.Element => {
  const { t } = useTranslation();

  const lastCheck = job.metrics[0];

  const { mutate: deleteJob } = useDeleteMQTTJob();

  const handleDelete = (): void => {
    deleteJob({
      externalId: job.externalId,
    });
  };

  return (
    <Container className={className}>
      <Body level={2}>{job.topicFilter}</Body>
      <Body level={2}>
        {lastCheck && (
          <>
            {t(`mqtt-job-status-${job.targetStatus}`)} (
            {t('checked-with-date', {
              relativeTime: formatDate(lastCheck.timestamp, true),
              postProcess: 'lowercase',
            })}
            )
          </>
        )}
      </Body>
      <Dropdown
        content={
          <Menu>
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
