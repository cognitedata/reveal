import { ComponentProps } from 'react';

import { Button } from '@cognite/cogs.js';

export const ButtonFullscreen = ({
  children,
  ...props
}: React.PropsWithChildren<ComponentProps<typeof Button>>) => {
  return (
    <Button
      icon="Expand"
      aria-label="Fullscreen"
      type="tertiary"
      {...(props as any)}
    >
      {children}
    </Button>
  );
};
