import { Icon } from '@cognite/cogs.js';

import { ResourceType } from '@data-exploration-components';

export const BreadcrumbItemIcon = ({ type }: { type: ResourceType }) => {
  switch (type) {
    case 'timeSeries':
      return <Icon type="Timeseries" />;
    case 'file':
      return <Icon type="Document" />;
    case 'sequence':
      return <Icon type="Sequences" />;
    case 'event':
      return <Icon type="Events" />;
    case 'asset':
      return <Icon type="Assets" />;
    case 'threeD':
      return <Icon type="Cube" />;
    default:
      throw new Error('Invalid Type');
  }
};
