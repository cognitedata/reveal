import styled from 'styled-components';
import { StyledEdit } from 'styles/StyledButton';
import { Colors, Title } from '@cognite/cogs.js';
import React, { PropsWithChildren } from 'react';

export const HeadingStyledEdit = styled(StyledEdit)`
  font-weight: bold;
`;
export const StyledTitle = styled(Title)`
  border-bottom: 1px solid ${Colors['greyscale-grey2'].hex()};
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
`;

interface DetailHeadingEditProps {
  onClick: () => void;
}

export const DetailHeadingEditBtn = ({
  onClick,
  children,
}: PropsWithChildren<DetailHeadingEditProps>) => {
  return (
    <StyledTitle level={3}>
      <HeadingStyledEdit onClick={onClick} $full>
        {children}
      </HeadingStyledEdit>
    </StyledTitle>
  );
};
