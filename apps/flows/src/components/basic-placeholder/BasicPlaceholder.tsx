import { ReactNode } from 'react';

import { Illustrations, IllustrationType } from '@cognite/cogs.js';

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
  type: IllustrationType;
  title?: string;
  size?: number;
  children?: ReactNode;
}) => (
  <StyledContainer>
    <StyledGraphic>
      <Illustrations.Solo type={type} style={{ width: size }} />
    </StyledGraphic>
    {title && (
      <StyledTitle level={5} muted>
        {title}
      </StyledTitle>
    )}
    <StyledContent>{children}</StyledContent>
  </StyledContainer>
);
