import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { notification } from 'antd';

import { createLink } from '@cognite/cdf-utilities';
import { Body, Checkbox, Flex, Modal, ModalProps } from '@cognite/cogs.js';

import { Trans, useTranslation } from '../../common';
import {
  MQTTSourceWithJobMetrics,
  useDeleteMQTTSource,
} from '../../hooks/hostedExtractors';

type DeleteSourceModalProps = {
  onCancel: () => void;
  source: MQTTSourceWithJobMetrics;
  visible: ModalProps['visible'];
};

const DeleteSourceModal = ({
  onCancel,
  source,
  visible,
}: DeleteSourceModalProps): JSX.Element => {
  const { t } = useTranslation();

  const [isChecked, setIsChecked] = useState(false);

  const navigate = useNavigate();

  const { mutate: deleteSource } = useDeleteMQTTSource({
    onSuccess: () => {
      notification.success({
        message: t('notification-success-source-delete'),
        key: 'delete-source',
      });
      navigate(createLink('/extpipes', { tab: 'hosted' }));
    },
    onError: (e: any) => {
      notification.error({
        message: e.toString(),
        description: e.message,
        key: 'delete-source',
      });
    },
  });

  const sourceContainsActiveJobs = useMemo(() => {
    return !!source.jobs.length;
  }, [source]);

  const handleDelete = useCallback((): void => {
    deleteSource({
      externalId: source.externalId,
      force: sourceContainsActiveJobs,
    });
  }, [source.externalId, sourceContainsActiveJobs, deleteSource]);

  return (
    <StyledModal
      destructive
      onCancel={onCancel}
      okDisabled={sourceContainsActiveJobs ? !isChecked : false}
      okText={t('delete')}
      onOk={handleDelete}
      title={t('delete-connection')}
      visible={visible}
    >
      <Flex direction="column" gap={10}>
        {sourceContainsActiveJobs ? (
          <>
            <Trans
              i18nKey="delete-connection-jobs-warning"
              values={{ connection: source.externalId }}
              components={{
                1: <Body size="medium"></Body>,
                2: <strong></strong>,
              }}
            ></Trans>

            <Checkbox
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            >
              <Trans
                i18nKey="delete-connection-checkbox"
                values={{ connection: source.externalId }}
                components={{
                  1: <Body size="medium"></Body>,
                  2: <strong></strong>,
                }}
              ></Trans>
            </Checkbox>
          </>
        ) : (
          <Trans
            i18nKey="delete-connection-warning"
            values={{ connection: source.externalId }}
            components={{
              1: <Body size="medium"></Body>,
              2: <strong></strong>,
            }}
          ></Trans>
        )}
      </Flex>
    </StyledModal>
  );
};

const StyledModal = styled(Modal)`
  .cogs-modal__content-container {
    overflow: hidden;
  }
`;
export default DeleteSourceModal;
