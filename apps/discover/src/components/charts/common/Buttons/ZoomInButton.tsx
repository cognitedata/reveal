import { Button, ButtonProps } from '@cognite/cogs.js';

export const ZoomInButton: React.FC<ButtonProps> = ({ ...props }) => (
  <Button
    {...props}
    type="ghost"
    icon="ZoomIn"
    size="small"
    aria-label="ZoomIn"
    data-testid="chart-zoom-in-button"
  />
);
