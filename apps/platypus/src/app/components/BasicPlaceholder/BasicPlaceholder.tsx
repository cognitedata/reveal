import { ReactChild } from 'react';
import { Graphic } from '@cognite/cogs.js';

import {
  StyledContainer,
  StyledContent,
  StyledGraphic,
  StyledTitle,
} from './elements';

export const BasicPlaceholder = ({
  type,
  title,
  size = 150,
  children,
}: {
  type: string;
  title?: string;
  size?: number;
  children?: ReactChild;
}) => (
  <StyledContainer>
    <StyledGraphic>
      <Graphic type={type} style={{ width: size }} />
    </StyledGraphic>
    {title && <StyledTitle level={5}>{title}</StyledTitle>}
    <StyledContent>{children}</StyledContent>
  </StyledContainer>
);
