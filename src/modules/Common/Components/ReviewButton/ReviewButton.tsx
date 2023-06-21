import { Button } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';

// using noBackground flag to disable background when button disabled
interface ReviewButtonProps {
  onClick: (evt: any) => void;
  disabled?: boolean;
  noBackground?: boolean;
}

export const ReviewButton = ({
  onClick,
  disabled,
  noBackground,
}: ReviewButtonProps) => {
  return (
    <ButtonReview
      type="tertiary"
      icon="Edit"
      iconPlacement="left"
      onClick={onClick}
      disabled={disabled}
      aria-label="Review"
      nobackground={`${noBackground}`}
    >
      Review
    </ButtonReview>
  );
};

export const ButtonReview = styled(Button)<{ nobackground?: string }>`
  &:disabled {
    background: ${(props) =>
      props.nobackground === 'true' ? 'none' : undefined};
  }
`;
