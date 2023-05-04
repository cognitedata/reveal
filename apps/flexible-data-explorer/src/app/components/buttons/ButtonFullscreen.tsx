import { Button } from '@cognite/cogs.js';
import { ComponentProps } from 'react';

export const ButtonFullscreen = (props: ComponentProps<typeof Button>) => {
  return (
    <Button
      icon="FullScreen"
      aria-label="Fullscreen"
      type="tertiary"
      {...(props as any)}
    />
  );
};
