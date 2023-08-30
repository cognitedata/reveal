import { IconProps } from '@cognite/cogs.js';

import { BaseIcon } from './BaseIcon';

type LoadingIconProps = Omit<IconProps, 'type'>;

export const LoadingIcon = (props: LoadingIconProps) => {
  return <BaseIcon {...props} type="Loader" />;
};
