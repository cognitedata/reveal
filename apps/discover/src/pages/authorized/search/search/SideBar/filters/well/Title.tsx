import { useClearWellsFilters } from 'domain/savedSearches/internal/hooks/useClearWellsFilters';

import CommonTitle from '../common/Title';
import { WellIconWrapper, WellIcon } from '../elements';

import { TITLE, CATEGORY } from './constants';

export const Title: React.FC = () => {
  const clearWellFilters = useClearWellsFilters();

  return (
    <CommonTitle
      title={TITLE}
      category={CATEGORY}
      iconElement={
        <WellIconWrapper>
          <WellIcon type="OilPlatform" />
        </WellIconWrapper>
      }
      description="Search for wells and wellbores by source, characteristics, events and more"
      handleClearFilters={clearWellFilters}
    />
  );
};
