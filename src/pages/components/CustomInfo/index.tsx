import React, { useState } from 'react';
import { Button, Colors, Icon, Tooltip, Infobox } from '@cognite/cogs.js';
import styled from 'styled-components';
import DeleteConfirmModal from '../DeleteConfirmModal';
import { CONFIRM, DELETE, INFO } from 'utils/constants';

const CustomInfo = (props: any) => {
  const {
    type,
    alertTitle,
    alertMessage,
    alertBtnType,
    alertBtnLabel,
    alertBtnDisabled,
    helpEnabled,
    helpTooltipMessage,
    confirmTitle,
    confirmMessage,
    confirmLabel,
    onClickConfirm,
    hideModal = false,
  } = props;

  const [isModalVisible, setIsModalVisible] = useState(false);

  const closeConfirmModal = () => {
    setIsModalVisible(false);
  };

  const showConfirmModal = () => {
    setIsModalVisible(true);
  };

  const handleSubmit = () => {
    onClickConfirm();
    closeConfirmModal();
  };

  return (
    <StyledInfoboxContainer>
      <Infobox type={type || 'neutral'} title={alertTitle || INFO}>
        {alertMessage}
        <StyledDisableButtonSection>
          {alertBtnLabel && (
            <Button
              disabled={alertBtnDisabled}
              onClick={showConfirmModal}
              type={alertBtnType || 'normal'}
            >
              {alertBtnLabel}
            </Button>
          )}
          {helpEnabled && (
            <Tooltip content={helpTooltipMessage}>
              <StyledHelpIcon size={20} type="HelpFilled" />
            </Tooltip>
          )}
        </StyledDisableButtonSection>
        {!hideModal && (
          <DeleteConfirmModal
            isOpen={isModalVisible}
            confirmTitle={confirmTitle || alertTitle || CONFIRM}
            confirmMessage={confirmMessage}
            confirmLabel={confirmLabel || DELETE}
            onCancel={closeConfirmModal}
            onConfirm={handleSubmit}
          />
        )}
      </Infobox>
    </StyledInfoboxContainer>
  );
};

const StyledInfoboxContainer = styled.div`
  margin-bottom: 18px;
`;

const StyledDisableButtonSection = styled.div`
  align-items: center;
  display: flex;
`;

export const StyledHelpIcon = styled(Icon)`
  color: ${Colors['text-hint']};
  margin: 4px 0 0 8px;
`;

export default CustomInfo;
