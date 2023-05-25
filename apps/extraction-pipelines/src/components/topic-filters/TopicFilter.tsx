import React, { useState } from 'react';
import { Body, Button, Colors, Dropdown, Menu, Status } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useTranslation } from 'common';
import {
  MQTTJobWithMetrics,
  useDeleteMQTTJob,
  useUpdateMQTTJob,
} from 'hooks/hostedExtractors';
import { notification } from 'antd';
import { getJobStatusForCogs } from 'utils/hostedExtractors';
import { EditJobsModal } from 'components/edit-job-modal/EditJobModal';

type TopicFilterProps = {
  className?: string;
  job: MQTTJobWithMetrics;
};

export const TopicFilter = ({
  className,
  job,
}: TopicFilterProps): JSX.Element => {
  const [editJobsModalVisible, setEditJobsModalVisible] = useState(false);
  const { t } = useTranslation();

  const { mutate: deleteJob } = useDeleteMQTTJob();
  const { mutate: updateJob } = useUpdateMQTTJob();

  const handleDelete = (): void => {
    try {
      deleteJob({
        externalId: job.externalId,
      });
      notification.success({
        message: t('job-delete-success'),
        key: 'delete-job',
      });
    } catch (error: any) {
      notification.error({
        message: error.toString(),
        description: error.message,
        key: 'delete-job',
      });
    }
  };

  const handleUpdateTargetStatus = (): void => {
    try {
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
      notification.success({
        message: t('job-status-update-success', { status: nextTargetStatus }),
        key: 'update-job',
      });
    } catch (error: any) {
      notification.error({
        message: error.toString(),
        description: error.message,
        key: 'update-job',
      });
    }
  };

  return (
    <>
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
                icon="Edit"
                iconPlacement="left"
                onClick={() => setEditJobsModalVisible(true)}
              >
                {t('edit')}
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
      {editJobsModalVisible && (
        <EditJobsModal
          onCancel={() => setEditJobsModalVisible(false)}
          jobId={job.externalId}
          visible={editJobsModalVisible}
        />
      )}
    </>
  );
};

const Container = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 1fr 1fr min-content;
  border-bottom: 1px solid ${Colors['border--interactive--disabled']};
  padding: 12px 16px;
`;
