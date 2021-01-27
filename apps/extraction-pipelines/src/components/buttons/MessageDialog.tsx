import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { Button, Title, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ErrorIcon } from '../icons/ErrorIcon';
import { CANCEL, OK } from '../../utils/constants';

export const DialogStyle = styled.div`
  display: grid;
  grid-template-areas:
    'icon heading heading'
    'nothing content content'
    'empty cancel btn';
  column-gap: 0.75rem;

  .cogs-icon {
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
  .cogs-title-4 {
    grid-area: heading;
    align-self: center;
    font-size: 1rem;
    font-weight: bold;
  }
  .content {
    grid-area: content;
    width: 15rem;
    margin-top: 0.5rem;
    margin-bottom: 0;
  }
`;
interface OwnProps {
  visible: boolean;
  handleClickError: () => void;
  title: string;
  handleCancel?: () => void;
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
  contentText = '',
  confirmBtnText = OK,
  cancelBtnText = CANCEL,
  children,
}: PropsWithChildren<Props>) => {
  const [showError, setShowError] = useState(false);
  useEffect(() => {
    if (visible !== undefined) {
      setShowError(visible);
    }
  }, [visible]);

  return (
    <Tooltip
      className="cogs-popconfirm z-4 save-btn"
      content={
        <DialogStyle>
          <ErrorIcon />
          <Title level={4}>{title}</Title>
          <p className="content">{contentText}</p>
          {handleCancel && (
            <Button id="dialog-cancel-btn" onClick={handleCancel}>
              {cancelBtnText}
            </Button>
          )}
          <Button type="primary" onClick={handleClickError}>
            {confirmBtnText}
          </Button>
        </DialogStyle>
      }
      interactive
      visible={showError}
      placement="top-end"
    >
      <>{children}</>
    </Tooltip>
  );
};

export default MessageDialog;
