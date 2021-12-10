import { Button } from '@cognite/cogs.js';
import React from 'react';

interface ReviewButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ReviewButton = ({ onClick, disabled }: ReviewButtonProps) => {
  return (
    <Button
      type="tertiary"
      icon="Edit"
      iconPlacement="left"
      onClick={onClick}
      disabled={disabled}
      aria-label="Review"
    >
      Review
    </Button>
  );
};
