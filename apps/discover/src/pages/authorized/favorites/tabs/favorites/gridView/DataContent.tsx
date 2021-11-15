import React from 'react';

import { useTheme } from 'styles/useTheme';

import { ContentRow, LabelHeader, Value } from '../elements';

export interface Props {
  header: string;
  data: string;
}

export const DataContent: React.FC<Props> = React.memo(({ header, data }) => {
  const theme = useTheme();

  return (
    <ContentRow>
      <LabelHeader theme={theme}>{header}</LabelHeader>
      <Value>{data}</Value>
    </ContentRow>
  );
});
