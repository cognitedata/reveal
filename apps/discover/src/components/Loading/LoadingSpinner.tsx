import React from 'react';

import styled from 'styled-components/macro';

import { Icon, IconProps } from '@cognite/cogs.js';

import { FlexAlignJustifyContent } from 'styles/layout';

interface Props extends Omit<IconProps, 'type'> {
  isLoading?: boolean;
  message?: string;
}

export const MessageWrapper = styled.div`
  padding-left: 8px;
`;

export const LoadingSpinner: React.FC<Props> = ({ isLoading, message }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <FlexAlignJustifyContent>
      <Icon type="Loader" data-testid="loading-spinner" />
      {message && <MessageWrapper>{message}</MessageWrapper>}
    </FlexAlignJustifyContent>
  );
};
