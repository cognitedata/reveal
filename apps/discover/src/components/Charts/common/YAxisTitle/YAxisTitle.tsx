import React from 'react';

import { AxisTitleContainer, AxisTitle } from './elements';

interface Props {
  title?: string;
}

export const YAxisTitle: React.FC<Props> = React.memo(({ title }) => {
  if (!title) return null;

  return (
    <AxisTitleContainer>
      <AxisTitle data-testid="y-axis-title">{title}</AxisTitle>
    </AxisTitleContainer>
  );
});
