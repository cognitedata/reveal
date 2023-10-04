import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { createInternalLink } from '@transformations/utils';
import { useCdfUserHistoryService } from '@user-history';
import { Alert } from 'antd';

import { Body, Flex, Modal } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import Collapse from '../collapse';

type RunConfirmationModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  items: { id: number | string; name: string }[];
  shouldLogUsage?: boolean;
  transformationName?: string;
  transformationId?: number;
};

const RunConfirmationModal = ({
  onCancel,
  onConfirm,
  open,
  items,
  // We use the following three props in order to properly store the usage of the transformation
  shouldLogUsage = false,
  transformationName,
  transformationId,
}: RunConfirmationModalProps): JSX.Element => {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const userHistoryService = useCdfUserHistoryService();

  const handleLogNewResourceEdit = () => {
    if (shouldLogUsage) {
      if (subAppPath && transformationName) {
        userHistoryService.logNewResourceEdit({
          application: subAppPath,
          name: transformationName,
          path: createInternalLink(`${transformationId}`),
        });
      }
    }
  };

  return (
    <Modal
      okText={t('yes-run-now')}
      cancelText={t('cancel')}
      onCancel={onCancel}
      onOk={() => {
        onConfirm();
        handleLogNewResourceEdit();
      }}
      title={t('warning')}
      visible={open}
      size="small"
    >
      <Flex direction="column" gap={10}>
        <Body level={2}>
          {t('this-query-has-not-been-verified-for-run', {
            count: items.length,
          })}
        </Body>
        {items.length > 5 && (
          <Collapse
            title={t('n-transformations', { count: items.length })}
            type="info"
          >
            <StyledList>
              {items.map((row) => (
                <li key={row.id}>
                  <Body level="3">{row.name}</Body>
                </li>
              ))}
            </StyledList>
          </Collapse>
        )}
        {items.length < 5 && items.length > 1 && (
          <Alert
            type="info"
            message={
              <StyledList>
                {items.map((row) => (
                  <li key={row.id}>
                    <Body level="3">{row.name}</Body>
                  </li>
                ))}
              </StyledList>
            }
          />
        )}
      </Flex>
    </Modal>
  );
};

const StyledList = styled.ul`
  margin: 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export default RunConfirmationModal;
