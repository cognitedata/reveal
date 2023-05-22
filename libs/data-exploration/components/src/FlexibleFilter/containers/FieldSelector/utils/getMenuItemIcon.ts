import { IconType } from '@cognite/cogs.js';

import { FieldType } from '../../../types';

export const getMenuItemIcon = (type: FieldType): IconType => {
  switch (type) {
    case 'string':
      return 'String';

    case 'number':
      return 'Number';

    case 'boolean':
      return 'Boolean';

    case 'date':
      return 'Calendar';

    default:
      return undefined;
  }
};
