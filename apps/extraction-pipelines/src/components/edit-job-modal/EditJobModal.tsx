import React, { ChangeEvent, useState } from 'react';

import { notification } from 'antd';

import { InputExp, Modal, ModalProps } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { ReadMQTTJob, useUpdateMQTTJob } from '../../hooks/hostedExtractors';

type EditJobsModalProps = {
  onCancel: () => void;
  job: ReadMQTTJob;
  visible: ModalProps['visible'];
};

export const EditJobModal = ({
  onCancel,
  job,
  visible,
}: EditJobsModalProps): JSX.Element => {
  const [tempTopicFilterInput, setTempTopicFilterInput] = useState(
    job.config.topicFilter
  );

  const { t } = useTranslation();

  const { mutateAsync: updateJob } = useUpdateMQTTJob({
    onSuccess: () => {
      notification.success({
        message: t('topic-filter-edit-success'),
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

  const handleEdit = (e: ChangeEvent<HTMLInputElement>) => {
    setTempTopicFilterInput(e.target.value);
  };

  const handleUpdate = () => {
    updateJob({
      externalId: job?.externalId ?? '',
      update: {
        config: {
          set: {
            topicFilter: tempTopicFilterInput,
          },
        },
      },
    });
  };

  return (
    <Modal
      onCancel={onCancel}
      okText={t('save')}
      onOk={handleUpdate}
      title={t('edit-topic-filter')}
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
        value={tempTopicFilterInput}
      />
    </Modal>
  );
};
