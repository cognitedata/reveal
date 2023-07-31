import isUndefined from 'lodash/isUndefined';

import { Label } from '@cognite/cogs.js';

export const ValueLabel = (value?: string | number) => {
  if (isUndefined(value)) {
    return '';
  }

  const variant = value ? 'default' : 'unknown';

  return (
    <Label size="medium" variant={variant}>
      {value}
    </Label>
  );
};
