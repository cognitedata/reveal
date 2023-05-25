import React, { ChangeEvent, useState } from 'react';
import { InputExp, Modal, ModalProps } from '@cognite/cogs.js';
import { notification } from 'antd';

import { useTranslation } from 'common';
import {
  useMQTTJobs,
  useMQTTSourceWithMetrics,
  useUpdateMQTTJob,
} from 'hooks/hostedExtractors';
import { useParams } from 'react-router-dom';

type EditJobsModalProps = {
  onCancel: () => void;
  jobId: string;
  visible: ModalProps['visible'];
};

export const EditJobsModal = ({
  onCancel,
  jobId,
  visible,
}: EditJobsModalProps): JSX.Element => {
  const [tempTopicFilterInput, setTempTopicFilterInput] = useState('');
  const [topicFilterChanged, setTopicFilterChanged] = useState(false);

  const { t } = useTranslation();
  const { externalId = '' } = useParams<{
    externalId: string;
  }>();

  const { data: source } = useMQTTSourceWithMetrics(externalId);
  const { data: MQTTJobs } = useMQTTJobs(source?.externalId);

  const { mutateAsync: updateJob } = useUpdateMQTTJob({
    onSuccess: () => {
      notification.success({
        message: 'Success',
        key: 'update-source',
      });
      onCancel();
    },
    onError: (e: any) => {
      notification.error({
        message: e.toString(),
        description: e.message,
        key: 'update-source',
      });
    },
  });

  const topicFilter =
    MQTTJobs?.find((item) => item.externalId === jobId)?.topicFilter ?? '';

  const jobExternalId = MQTTJobs?.find(
    (item) => item.externalId === jobId
  )?.externalId;

  const handleEdit = (e: ChangeEvent<HTMLInputElement>) => {
    setTopicFilterChanged(true);
    setTempTopicFilterInput(e.target.value);
  };

  const handleUpdate = () => {
    updateJob({
      externalId: jobExternalId ?? '',
      update: {
        topicFilter: {
          set: tempTopicFilterInput,
        },
      },
    });
  };

  return (
    <Modal
      onCancel={onCancel}
      okText={t('save')}
      onOk={handleUpdate}
      title={t('edit-topic-filters')}
      visible={visible}
    >
      <InputExp
        label={{
          info: t('form-topic-filters-info'),
          required: true,
          text: t('topic-filter_other'),
        }}
        fullWidth
        onChange={handleEdit}
        value={topicFilterChanged ? tempTopicFilterInput : topicFilter}
      />
    </Modal>
  );
};
