import React, { useRef, useState } from 'react';

import { Button, Colors, Icon, Tooltip } from '@cognite/cogs.js';
import { Alert as AntdAlert, Modal } from 'antd';
import styled from 'styled-components';
import {
  NUMBER_OF_SECONDS_TO_ALLOW_DISABLING,
  OK,
  CANCEL,
} from '../../utils/constants';

const StyledAlert = styled(AntdAlert)`
  margin-bottom: 16px;
`;

const StyledModalContent = styled.div`
  display: flex;
  align-items: center;
  font-size: 16px;
`;

const StyledModalWarningIcon = styled(Icon)`
  color: ${Colors.danger};
  margin-right: 8px;
`;

const StyledModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const StyledModalButton = styled(Button)`
  :not(:last-child) {
    margin-right: 12px;
  }
`;

const StyledDisableButtonSection = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 4px;
`;

const StyledHelpIcon = styled(Icon)`
  color: ${Colors['text-hint']};
  margin: 4px 0 0 8px;
`;

const CustomAlert = (props: any) => {
  const {
    type,
    alertMessage,
    alertBtnLabel,
    alertBtnDisabled,
    helpEnabled,
    helpTooltipMessage,
    confirmMessage,
    confirmLabel,
    onClickConfirm,
  } = props;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [remainingTime, setRemainingTime] = useState(
    NUMBER_OF_SECONDS_TO_ALLOW_DISABLING
  );
  const timerRef = useRef<NodeJS.Timeout>();

  const closeConfirmModal = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setRemainingTime(NUMBER_OF_SECONDS_TO_ALLOW_DISABLING);
    setIsModalVisible(false);
  };

  const showConfirmModal = () => {
    const decrementRemainingTime = () => {
      timerRef.current = setTimeout(() => {
        setRemainingTime(prevRemainingTime => {
          const decrementedRemainingTime = prevRemainingTime - 1;
          if (decrementedRemainingTime > 0) {
            decrementRemainingTime();
          }
          return decrementedRemainingTime;
        });
      }, 1000);
    };

    decrementRemainingTime();
    setIsModalVisible(true);
  };

  const handleSubmit = () => {
    onClickConfirm();
    closeConfirmModal();
  };

  return (
    <StyledAlert
      message={
        <>
          {alertMessage}
          <StyledDisableButtonSection>
            <Button
              disabled={alertBtnDisabled}
              onClick={showConfirmModal}
              type="danger"
            >
              {alertBtnLabel}
            </Button>
            {helpEnabled && (
              <Tooltip content={helpTooltipMessage}>
                <StyledHelpIcon size={20} type="HelpFilled" />
              </Tooltip>
            )}
          </StyledDisableButtonSection>
          <Modal
            footer={null}
            onCancel={closeConfirmModal}
            visible={isModalVisible}
          >
            <StyledModalContent>
              <StyledModalWarningIcon size={20} type="WarningStroke" />
              {confirmMessage}
            </StyledModalContent>
            <StyledModalButtons>
              <StyledModalButton onClick={closeConfirmModal} type="tertiary">
                {CANCEL}
              </StyledModalButton>
              <StyledModalButton
                disabled={alertBtnDisabled || remainingTime > 0}
                onClick={handleSubmit}
                type="danger"
              >
                {confirmLabel || OK}
                {remainingTime > 0 ? ` (${remainingTime})` : ''}
              </StyledModalButton>
            </StyledModalButtons>
          </Modal>
        </>
      }
      type={type}
    />
  );
};

export default CustomAlert;
