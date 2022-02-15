import React from 'react';

import { useStatsGetQuery } from 'services/stats/useStatsQuery';
import styled from 'styled-components/macro';
import { formatBigNumbersWithSuffix } from 'utils/number';

import { CategoryTypes } from 'modules/sidebar/types';
import { FlexAlignItems } from 'styles/layout';

import { CategorySwitch } from './CategorySwitch';
import { StatViewer } from './elements';
import { FilterClearButton } from './FilterClearButton';

const Container = styled(FlexAlignItems)`
  width: 100%;
  max-height: 25px;
  margin-left: 5px;
`;

interface Props {
  category: Exclude<CategoryTypes, 'landing'>;
  displayClear?: boolean;
  displayCategorySwitch?: boolean;
  handleClearFilters?: () => void;
}

export const FilterActions: React.FC<Props> = React.memo(
  ({ category, displayClear, displayCategorySwitch, handleClearFilters }) => {
    const { data: statsCount } = useStatsGetQuery();

    const renderCategoryStats = () => {
      const getCategoryCount = statsCount && statsCount[category];

      if (getCategoryCount) {
        if (getCategoryCount?.total === -1) {
          return null;
        }

        return (
          <StatViewer>
            {formatBigNumbersWithSuffix(getCategoryCount?.total)}
          </StatViewer>
        );
      }

      return null;
    };

    return (
      <Container>
        {renderCategoryStats()}
        {displayCategorySwitch && <CategorySwitch />}
        <FilterClearButton
          displayClear={displayClear}
          handleClearFilters={handleClearFilters}
          category={category}
        />
      </Container>
    );
  }
);
