import React from 'react';
import styled from 'styled-components';
import { CenterFullVH } from 'styles/StyledWrapper';
import { Button, Icon, Title } from '@cognite/cogs.js';
import { ErrorObj, ErrorVariations } from 'model/SDKErrors';

const ErrorCard = styled((props) => (
  <CenterFullVH {...props}>{props.children}</CenterFullVH>
))`
  padding: 1.5rem 2rem;
  box-shadow: 0 0.1875rem 0.375rem -0.25rem rgba(0, 0, 0, 0.12),
    0 0.375rem 1rem rgba(0, 0, 0, 0.08),
    0 0.5625rem 1.75rem 0.5rem rgba(0, 0, 0, 0.05);
  border-radius: 0.125rem;
  width: 26rem;
  height: 10.25rem;

  display: grid;
  grid-template-areas:
    'icon heading heading'
    'nothing content content'
    'empty empty btn';
  .cogs-icon {
    grid-area: icon;
    align-self: center;
  }
  .cogs-btn {
    grid-area: btn;
    justify-self: flex-end;
  }
  .cogs-title-2 {
    grid-area: heading;
    align-self: center;
    font-size: 1rem;
    font-weight: bold;
  }
  .content {
    grid-area: content;
  }
`;
const ErrorIcon = styled((props) => <Icon {...props} />)`
  width: 1.5rem;
  svg {
    path {
      &:nth-child(2),
      &:nth-child(3) {
        fill: red;
      }
    }
  }
`;

interface ErrorFeedbackProps {
  error: ErrorVariations;
  // eslint-disable-next-line
  onClick?: () => void;
  // eslint-disable-next-line
  btnText?: string;
  // eslint-disable-next-line
  fallbackTitle?: string;
  // eslint-disable-next-line
  contentText?: string;
}

const findErrorText = (error: ErrorVariations): ErrorObj | null => {
  if (error.error) {
    return {
      code: error.error.code,
      message: error.error.message,
    };
  }
  if (error.data) {
    return {
      code: error.data.code,
      message: error.data.message,
    };
  }
  if (error.code && error.message) {
    return {
      code: error.code,
      message: error.message,
    };
  }
  return null;
};

export function ErrorFeedback({
  error,
  onClick = () => null,
  btnText = 'Done',
  fallbackTitle = '',
  contentText = '',
}: ErrorFeedbackProps) {
  let showBtn = true;
  const errorObj = findErrorText(error);
  const title = errorObj?.code ?? fallbackTitle;
  const message = errorObj?.message ?? contentText;
  if (errorObj?.code === 403 || errorObj?.code === 401) {
    showBtn = false;
  }
  return (
    <ErrorCard>
      <ErrorIcon type="ErrorStroked" />
      <Title level={2}>{title}</Title>
      <p className="content">{message}</p>
      {showBtn && (
        <Button type="primary" onClick={onClick}>
          {btnText}
        </Button>
      )}
    </ErrorCard>
  );
}
