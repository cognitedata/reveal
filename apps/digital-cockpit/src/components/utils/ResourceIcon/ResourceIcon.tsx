import { Icon } from '@cognite/cogs.js';

import { IconWrapper } from './elements';

export type ResourceIconProps = {
  type: 'Timeseries' | 'Events' | 'Document';
};

const ResourceIcon = ({ type }: ResourceIconProps) => {
  return (
    <IconWrapper>
      <Icon type={type} />
    </IconWrapper>
  );
};

export default ResourceIcon;
