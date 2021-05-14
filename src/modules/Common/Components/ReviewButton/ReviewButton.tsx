import { Button } from '@cognite/cogs.js';
import React from 'react';

interface ReviewButtonProps {
  onClick: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}

export const ReviewButton = ({
  onClick,
  disabled,
  style,
}: ReviewButtonProps) => {
  return (
    <Button
      type="tertiary"
      icon="Edit"
      iconPlacement="left"
      style={style}
      onClick={onClick}
      disabled={disabled}
      aria-label="Review"
    >
      Review
    </Button>
  );
};
