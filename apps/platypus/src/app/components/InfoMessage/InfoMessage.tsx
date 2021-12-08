import { ReactChild } from 'react';
import { Graphic } from '@cognite/cogs.js';

import {
  StyledContainer,
  StyledContent,
  StyledGraphic,
  StyledIcon,
  StyledTitle,
} from './elements';

const types: string[] = ['error'];

export const InfoMessage = ({
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
    {!types.includes(type.toLocaleLowerCase()) ? (
      <StyledGraphic>
        <Graphic type={type} style={{ width: size }} />
      </StyledGraphic>
    ) : (
      <StyledIcon type={type} size={size} />
    )}
    {title && <StyledTitle level={5}>{title}</StyledTitle>}
    <StyledContent>{children}</StyledContent>
  </StyledContainer>
);
