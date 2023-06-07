import {
  useGetJourney,
  useJourney,
  usePruneJourney,
} from '@data-exploration-app/hooks';
import { getTitle, JourneyItem } from '@data-exploration-lib/core';

import { Breadcrumb } from './Breadcrumb';
import { BreadcrumbItemWrapper, BreadcrumbsWrapper } from './elements';

// TODO;
// - add ellipsis for long journeys
export const BreadcrumbsV2 = () => {
  const [journey] = useJourney();
  const [firstJourney] = useGetJourney();
  const [, pruneJourney] = usePruneJourney();

  const handleBreadcrumbClick = (index: number) => {
    pruneJourney(index);
  };

  return (
    <BreadcrumbsWrapper>
      <BreadcrumbItemWrapper>
        <span style={{ whiteSpace: 'nowrap' }}>
          {firstJourney && firstJourney.type && getTitle(firstJourney.type)}
        </span>
      </BreadcrumbItemWrapper>
      {journey?.map(({ id, type }: JourneyItem, index: number) => {
        return (
          <Breadcrumb
            key={`${type}-${id}-${index}`}
            type={type!}
            id={id}
            onClick={() => handleBreadcrumbClick(index)}
          />
        );
      })}
    </BreadcrumbsWrapper>
  );
};
