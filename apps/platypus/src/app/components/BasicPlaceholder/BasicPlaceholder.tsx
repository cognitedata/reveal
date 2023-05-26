import { ReactNode } from 'react';

import { Illustrations, IllustrationType } from '@cognite/cogs.js';

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
  type: IllustrationType;
  title?: string;
  size?: number;
  onClose?: () => void;
  children?: ReactNode;
}) => (
  <StyledContainer>
    <StyledGraphic>
      <Illustrations.Solo type={type} style={{ width: size }} />
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
