import { FieldType } from '@fdx/shared/types/filters';

import { IconType } from '@cognite/cogs.js';

export const getMenuItemIcon = (type: FieldType): IconType | undefined => {
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
