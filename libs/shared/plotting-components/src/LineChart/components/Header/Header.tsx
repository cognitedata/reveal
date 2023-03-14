import * as React from 'react';

import isEmpty from 'lodash/isEmpty';

import { ChartSubtitle, ChartTitle, HeaderWrapper } from './elements';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
  showSubtitle?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showTitle,
  showSubtitle,
}) => {
  if (!showTitle || !showSubtitle || (isEmpty(title) && isEmpty(subtitle))) {
    return null;
  }

  return (
    <HeaderWrapper>
      {showTitle && !isEmpty(title) && <ChartTitle>{title}</ChartTitle>}
      {showSubtitle && !isEmpty(subtitle) && (
        <ChartSubtitle>{subtitle}</ChartSubtitle>
      )}
    </HeaderWrapper>
  );
};
