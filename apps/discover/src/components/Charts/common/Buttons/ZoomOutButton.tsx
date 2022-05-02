import { Button, ButtonProps } from '@cognite/cogs.js';

export const ZoomOutButton: React.FC<ButtonProps> = ({ ...props }) => (
  <Button
    {...props}
    type="ghost"
    icon="ZoomOut"
    size="small"
    aria-label="ZoomOut"
    data-testid="chart-zoom-out-button"
  />
);
