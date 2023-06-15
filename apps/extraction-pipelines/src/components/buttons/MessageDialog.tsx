import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@extraction-pipelines/common';
import { ErrorIcon } from '@extraction-pipelines/components/icons/ErrorIcon';
import { StyledTooltip } from '@extraction-pipelines/components/styled';

import { Button, Icon, Title } from '@cognite/cogs.js';
interface MessageDialogProps {
  visible: boolean;
  title: string;
  width?: number;
  icon?: React.ReactNode;
  handleClickError?: () => void;
  handleClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleCancel?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  contentText?: string;
  cancelBtnText?: string;
  confirmBtnText?: string;
  children: React.ReactNode;
}

const MessageDialog = (props: MessageDialogProps): JSX.Element => {
  const { t } = useTranslation();
  const {
    visible,
    handleCancel,
    handleClickError,
    title,
    width,
    handleClose,
    contentText = '',
    confirmBtnText = t('ok'),
    cancelBtnText = t('cancel'),
    icon = <ErrorIcon />,
    children,
  } = props;
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (visible !== undefined) {
      setShowError(visible);
    }
  }, [visible]);

  return (
    <StyledTooltip
      className="cogs-popconfirm z-4 save-btn"
      content={
        <DialogStyle dialogWidth={width}>
          {icon}
          <Title level={4} css="color: white">
            {title}
          </Title>
          {handleClose && (
            <Button
              id="dialog-close-btn"
              type="ghost"
              onClick={handleClose}
              aria-label="Close"
            >
              <Icon type="Close" />
            </Button>
          )}
          <p className="content">{contentText}</p>
          {handleCancel && (
            <Button id="dialog-cancel-btn" onClick={handleCancel}>
              {cancelBtnText}
            </Button>
          )}
          {handleClickError && (
            <Button type="primary" onClick={handleClickError}>
              {confirmBtnText}
            </Button>
          )}
        </DialogStyle>
      }
      interactive
      visible={showError}
      placement="top-end"
    >
      <>{children}</>
    </StyledTooltip>
  );
};

export const DialogStyle = styled.div`
  display: grid;
  grid-template-areas:
    'icon heading close'
    'nothing content content'
    'empty cancel btn';
  column-gap: 0.75rem;

  .cogs-icon,
  svg {
    grid-area: icon;
    align-self: center;
  }
  .cogs-btn {
    grid-area: btn;
    justify-self: flex-end;
  }
  #dialog-cancel-btn {
    grid-area: cancel;
  }
  #dialog-close-btn {
    grid-area: close;
  }
  .cogs-title-4 {
    grid-area: heading;
    align-self: center;
    font-size: 1rem;
    font-weight: bold;
  }
  .content {
    grid-area: content;
    width: ${(props: { dialogWidth?: number }) =>
      props.dialogWidth ? `${props.dialogWidth}rem` : '15rem'};
    word-break: break-word;
    margin-top: 0.5rem;
    margin-bottom: 0;
    margin-right: 1rem;
  }
`;

export default MessageDialog;
