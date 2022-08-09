import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { Button, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { CANCEL, OK } from 'utils/constants';
import { ErrorIcon } from 'components/icons/ErrorIcon';
import { StyledTooltip } from 'components/styled';

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
interface OwnProps {
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
}

type Props = OwnProps;

const MessageDialog: FunctionComponent<Props> = ({
  visible,
  handleCancel,
  handleClickError,
  title,
  width,
  handleClose,
  contentText = '',
  confirmBtnText = OK,
  cancelBtnText = CANCEL,
  icon = <ErrorIcon />,
  children,
}: PropsWithChildren<Props>) => {
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

export default MessageDialog;
