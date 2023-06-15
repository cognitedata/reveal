import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import Collapse from '@transformations/components/collapse';
import { Alert } from 'antd';

import { Body } from '@cognite/cogs.js';

import UpdateModal from './UpdateModal';

export type UpdateScheduleModalProps = {
  scheduleType: 'pause' | 'resume' | undefined;
  handleClose: () => void;
  handleOk: () => void;
  items: { id: number | string; name: string }[];
  visible: boolean;
  loading: boolean;
};

const UpdateScheduleModal = ({
  scheduleType,
  handleClose,
  handleOk,
  items,
  visible,
  loading,
}: UpdateScheduleModalProps) => {
  const { t } = useTranslation();

  return (
    <UpdateModal
      scheduleType={scheduleType}
      bodyText={t(
        scheduleType === 'resume'
          ? 'these-transformations-will-resume'
          : 'these-transformations-will-be-paused',
        {
          count: items.length,
          name: items[0] ? items[0].name : '',
        }
      )}
      extraContent={
        <>
          {items.length > 5 && (
            <Collapse
              title={t('n-transformations', { count: items.length })}
              type="info"
            >
              <StyledErrorList>
                {items.map((row) => (
                  <li key={row.id}>
                    <Body level="3">{row.name}</Body>
                  </li>
                ))}
              </StyledErrorList>
            </Collapse>
          )}
          {items.length < 5 && items.length > 1 && (
            <Alert
              type="info"
              message={
                <StyledErrorList>
                  {items.map((row) => (
                    <li key={row.id}>
                      <Body level="3">{row.name}</Body>
                    </li>
                  ))}
                </StyledErrorList>
              }
            />
          )}
        </>
      }
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      items={items}
      cancelText={t('cancel')}
      loading={loading}
      okText={t(
        loading
          ? 'transformations-pause-schedule-modal-button-updating'
          : 'transformations-pause-schedule-modal-button-update',
        { count: items.length }
      )}
    />
  );
};

const StyledErrorList = styled.ul`
  margin: 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export default UpdateScheduleModal;
