import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { Button, Title, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { ErrorIcon } from '../icons/ErrorIcon';

const ErrorDialog = styled.div`
  display: grid;
  grid-template-areas:
    'icon heading heading'
    'nothing content content'
    'empty empty btn';
  column-gap: 0.75rem;

  .cogs-icon {
    grid-area: icon;
    align-self: center;
  }
  .cogs-btn {
    grid-area: btn;
    justify-self: flex-end;
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
  title?: string;
  contentText?: string;
}
export const SERVER_ERROR_TITLE: Readonly<string> =
  'Your changes have not been saved';
export const SERVER_ERROR_CONTENT: Readonly<string> =
  'Please try again later, or contact you system administrator.';
type Props = OwnProps;

const ErrorMessageDialog: FunctionComponent<Props> = ({
  visible,
  handleClickError,
  title = SERVER_ERROR_TITLE,
  contentText = SERVER_ERROR_CONTENT,
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
        <ErrorDialog>
          <ErrorIcon />
          <Title level={4}>{title}</Title>
          <p className="content">{contentText}</p>
          <Button onClick={handleClickError}>OK</Button>
        </ErrorDialog>
      }
      interactive
      visible={showError}
      placement="top-end"
    >
      <>{children}</>
    </Tooltip>
  );
};

export default ErrorMessageDialog;
