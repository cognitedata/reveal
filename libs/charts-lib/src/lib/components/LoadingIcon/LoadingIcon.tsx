import { Icon } from '@cognite/cogs.js';

export const LoadingIcon = () => (
  <Icon
    type="Loader"
    css={{
      top: 10,
      left: 10,
      position: 'relative',
      zIndex: 2,
      float: 'left',
    }}
  />
);
