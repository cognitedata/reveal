import { BaseFilter } from '../components/BaseFilter';
import { FilterCollapse } from '../components/FilterCollapse';

import Header from './common/Header';
import Title from './common/Title';
import { SeismicIconWrapper, SeismicIcon } from './elements';
import { TITLE, CATEGORY } from './seismic/constants';

export const SeismicFilter = () => {
  return (
    <BaseFilter>
      <Header
        title={TITLE}
        category={CATEGORY}
        displayBetaSymbol
        // handleClearFilters={}
      />
      <FilterCollapse category="seismic">
        <FilterCollapse.Panel title="Domain">
          <p>Coming Soon</p>
        </FilterCollapse.Panel>
        <FilterCollapse.Panel title="Survey">
          <p>Coming Soon</p>
        </FilterCollapse.Panel>
        <FilterCollapse.Panel title="Migration">
          <p>Coming Soon</p>
        </FilterCollapse.Panel>
        <FilterCollapse.Panel title="Acquisition Date">
          <p>Coming Soon</p>
        </FilterCollapse.Panel>
        <FilterCollapse.Panel title="Processing Date">
          <p>Coming Soon</p>
        </FilterCollapse.Panel>
      </FilterCollapse>
    </BaseFilter>
  );
};

SeismicFilter.Title = () => {
  return (
    <Title
      title={TITLE}
      category={CATEGORY}
      iconElement={
        <SeismicIconWrapper>
          <SeismicIcon type="Cube" />
        </SeismicIconWrapper>
      }
      displayBetaSymbol
      description="Search for seismic data based on survey name, acquisition and processing date and more"
      // handleClearFilters={}
    />
  );
};
