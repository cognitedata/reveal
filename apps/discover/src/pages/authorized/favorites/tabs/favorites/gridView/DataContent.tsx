import * as React from 'react';

import { ContentRow, LabelHeader, Value } from '../elements';

export interface Props {
  header: string;
  data: string;
}

export const DataContent: React.FC<Props> = React.memo(({ header, data }) => {
  return (
    <ContentRow>
      <LabelHeader>{header}</LabelHeader>
      <Value>{data}</Value>
    </ContentRow>
  );
});
