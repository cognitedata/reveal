import { ComponentProps } from 'react';

import { Button } from '@cognite/cogs.js';

export const ButtonInternalRedirect = (
  props: ComponentProps<typeof Button>
) => {
  return (
    <Button
      icon="ArrowUpRight"
      aria-label="ArrowUpRight"
      type="tertiary"
      {...(props as any)}
    />
  );
};
