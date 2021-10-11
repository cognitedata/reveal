import React from 'react';

import { Icon, IconProps } from '@cognite/cogs.js';

import { FlexAlignJustifyContent } from 'styles/layout';

interface Props extends Omit<IconProps, 'type'> {
  isLoading?: boolean;
}

export const LoadingSpinner: React.FC<Props> = (props: Props) => {
  const { isLoading = false } = props;
  if (!isLoading) {
    return null;
  }
  return (
    <FlexAlignJustifyContent>
      <Icon type="LoadingSpinner" data-testid="loading-spinner" />
    </FlexAlignJustifyContent>
  );
};
