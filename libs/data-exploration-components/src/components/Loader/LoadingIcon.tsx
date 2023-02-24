import { Icon } from '@cognite/cogs.js';
import { ExtendedIconProps } from './types';

export const LoadingIcon: React.FC<ExtendedIconProps> = ({ ...props }) => {
  return <Icon type="Loader" {...props} />;
};
