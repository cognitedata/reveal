import { AdvancedFilterBuilder } from '../../../builders';
import { DetailViewRelatedResourcesData } from '../types';

export const buildAdvancedFilterFromDetailViewData = (
  data: DetailViewRelatedResourcesData[]
) => {
  const builder = new AdvancedFilterBuilder<any>();
  builder.or(
    new AdvancedFilterBuilder<any>().in(
      'externalId',
      data.map(({ externalId }) => externalId)
    )
  );
  return builder.build();
};
