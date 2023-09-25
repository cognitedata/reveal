import React from 'react';

import styled from 'styled-components';

import { Button, Icon, Heading } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { CenterFullVH } from '../styled';

interface ErrorFeedbackProps {
  error?: { status?: number; message?: string };
  onClick?: () => void;
  btnText?: string;
  fallbackTitle?: string;
  contentText?: string;
}

export const ErrorFeedback = (props: ErrorFeedbackProps) => {
  const { t } = useTranslation();
  const {
    error,
    onClick = () => null,
    btnText = t('done'),
    fallbackTitle = '',
    contentText = '',
  } = props;
  let showBtn = true;

  const title = error?.status ?? fallbackTitle;
  const message = error?.message ?? contentText;

  if (error?.status === 403 || error?.status === 401) {
    showBtn = false;
  }

  return (
    <ErrorCard>
      <ErrorIcon type="Error" />
      <Heading level={2}>{title}</Heading>
      <p className="content">{message}</p>
      {showBtn && (
        <Button type="primary" onClick={onClick}>
          {btnText}
        </Button>
      )}
    </ErrorCard>
  );
};

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
  .cogs-heading-2 {
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
