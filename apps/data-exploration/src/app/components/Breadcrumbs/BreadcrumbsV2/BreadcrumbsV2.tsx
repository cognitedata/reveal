import {
  getTitle,
  JourneyItem,
  TFunction,
  useTranslation,
} from '@data-exploration-lib/core';

import { useGetJourney, useJourney, usePruneJourney } from '../../../hooks';

import { Breadcrumb } from './Breadcrumb';
import { BreadcrumbItemWrapper, BreadcrumbsWrapper } from './elements';

// TODO;
// - add ellipsis for long journeys
export const BreadcrumbsV2 = () => {
  const { t } = useTranslation();
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
          {getBreadcrumbTitle(firstJourney, t)}
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

const getBreadcrumbTitle = (journey: JourneyItem | undefined, t: TFunction) => {
  if (!journey?.type) {
    return;
  }

  const { type } = journey;

  const titleTranslationKey = `${type.toUpperCase()}_other`;
  const title = getTitle(type, true);

  return t(titleTranslationKey, title, {
    count: 2, // To pluralize
  });
};
