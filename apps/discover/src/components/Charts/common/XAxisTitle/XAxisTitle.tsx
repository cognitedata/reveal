import React from 'react';

import { AxisTitleContainer, AxisTitle } from './elements';

interface Props {
  title?: string;
}

export const XAxisTitle: React.FC<Props> = React.memo(({ title }) => {
  if (!title) {
    return null;
  }

  return (
    <AxisTitleContainer>
      <AxisTitle data-testid="x-axis-title">{title}</AxisTitle>
    </AxisTitleContainer>
  );
});
