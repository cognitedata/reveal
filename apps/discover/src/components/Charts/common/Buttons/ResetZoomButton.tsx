import { Button, ButtonProps } from '@cognite/cogs.js';

export const ResetZoomButton: React.FC<ButtonProps> = ({ ...props }) => (
  <Button
    {...props}
    type="ghost"
    icon="Refresh"
    size="small"
    aria-label="ResetZoom"
    data-testid="chart-reset-zoom-button"
  />
);
