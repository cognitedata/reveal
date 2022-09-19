import { Label } from '@cognite/cogs.js';

export const StatusLabel = ({
  value,
  onClick,
}: {
  value: string;
  onClick?: () => void;
}) => (
  <Label
    size="medium"
    variant="default"
    iconPlacement="right"
    onClick={onClick}
  >
    {value}
  </Label>
);
