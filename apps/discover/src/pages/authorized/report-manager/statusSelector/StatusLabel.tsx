import { Label, LabelProps } from '@cognite/cogs.js';

export const StatusLabel = ({
  value,
  onClick,
  variant = 'default',
}: {
  value: string;
  onClick?: () => void;
  variant?: LabelProps['variant'];
}) => (
  <Label
    size="medium"
    variant={variant}
    iconPlacement="right"
    onClick={onClick}
  >
    {value}
  </Label>
);
