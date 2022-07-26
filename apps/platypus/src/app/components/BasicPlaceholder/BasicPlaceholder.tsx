import { ReactChild } from 'react';
import { Graphic } from '@cognite/cogs.js';

import {
  StyledContainer,
  StyledContent,
  StyledGraphic,
  StyledTitle,
  CloseButton,
} from './elements';

export const BasicPlaceholder = ({
  type,
  title,
  size = 150,
  children,
  onClose,
}: {
  type: string;
  title?: string;
  size?: number;
  onClose?: () => void;
  children?: ReactChild;
}) => (
  <StyledContainer>
    <StyledGraphic>
      <Graphic type={type} style={{ width: size }} />
    </StyledGraphic>
    {onClose && (
      <CloseButton
        icon="Close"
        type="ghost"
        onClick={onClose}
        aria-label="Close placeholder"
      />
    )}
    {title && <StyledTitle level={5}>{title}</StyledTitle>}
    <StyledContent>{children}</StyledContent>
  </StyledContainer>
);
