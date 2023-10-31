import { SiteConfig } from '@fdx/shared/config/types';
import { ValueByField } from '@fdx/shared/types/filters';

import { FDMFilterBuilder } from '../FDMFilterBuilder';

export const buildGenericFilter = (
  params: ValueByField = {},
  config?: SiteConfig
) => {
  const builder = new FDMFilterBuilder();

  Object.entries(params).forEach(([field, fieldValue]) => {
    builder.construct(field, fieldValue);
  });

  builder.in('space', config?.instanceSpaces);

  return new FDMFilterBuilder().and(builder).build();
};
