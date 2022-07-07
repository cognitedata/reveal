import React, { useEffect, useMemo, useState } from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { Modal } from 'components/Modal';
import { NavigationPanel } from 'components/NavigationPanel';
import { OverlayNavigation } from 'components/OverlayNavigation';
import { Table } from 'components/Tablev3';
import { Treemap, TreeMapData } from 'components/Treemap';

import { ViewModeControl } from '../../../common/ViewModeControl';
import { EMPTY_APPLIED_FILTERS } from '../../constants';
import { AppliedFilters, FilterValues, NdsView } from '../../types';
import { getFilteredNdsData } from '../../utils/getFilteredNdsData';
import { getRiskTypeTreemapData } from '../../utils/getRiskTypeTreemapData';
import { getSubtypeTreemapData } from '../../utils/getSubtypeTreemapData';
import { Filters } from '../Filters';
import { WellboreTableWrapper } from '../NdsTreemap/elements';

import { NdsDetailedViewModes } from './constants';
import {
  DetailedViewContent,
  DetailedViewWrapper,
  FiltersBar,
} from './elements';
import { DetailedViewTable } from './table';
import { DetailedViewProps } from './types';

export const MORE_NODE_ID = 'more';

export const DetailedView: React.FC<DetailedViewProps> = ({
  data = [],
  ndsAggregate,
  isPreviousButtonDisabled,
  isNextButtonDisabled,
  onPreviousClick,
  onNextClick,
  onBackClick,
}) => {
  const [filteredData, setFilteredData] = useState<NdsView[]>(data);

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(
    EMPTY_APPLIED_FILTERS
  );
  const [selectedViewMode, setSelectedViewMode] =
    useState<NdsDetailedViewModes>(NdsDetailedViewModes.RiskType);
  const [events, setEvents] = useState<
    { name: string; numberOfEvents: number }[]
  >([]);

  const currentWellbore = head(data);

  const riskTypeTreemapData = useMemo(
    () => getRiskTypeTreemapData(filteredData),
    [filteredData]
  );

  const subtypeTreemapData = useMemo(
    () => getSubtypeTreemapData(filteredData),
    [filteredData]
  );

  const handleChangeFilter = (
    filter: keyof AppliedFilters,
    values: FilterValues
  ) => {
    setAppliedFilters((appliedFilters) => ({
      ...appliedFilters,
      [filter]: values,
    }));
  };

  const handleRickTypeTileClicked = (data: TreeMapData) => {
    const { id, riskTypes } = data;
    if (id === MORE_NODE_ID) {
      setEvents(riskTypes as { name: string; numberOfEvents: number }[]);
    }
  };

  const handleSubtypeTileClicked = (data: TreeMapData) => {
    const { id, subtypes } = data;
    if (id === MORE_NODE_ID) {
      setEvents(subtypes as { name: string; numberOfEvents: number }[]);
    }
  };

  useEffect(() => {
    const filteredData = getFilteredNdsData(data, appliedFilters);
    setFilteredData(filteredData);
  }, [appliedFilters, data]);

  useEffect(() => {
    if (isUndefined(ndsAggregate)) return;
    const { riskTypesAndSubtypes, severities, probabilities } = ndsAggregate;
    setAppliedFilters({
      riskType: riskTypesAndSubtypes,
      severity: severities,
      probability: probabilities,
    });
  }, [data, ndsAggregate]);

  return (
    <OverlayNavigation mount={!isEmpty(data)}>
      <DetailedViewWrapper>
        <NavigationPanel
          title={currentWellbore?.wellboreName || ''}
          subtitle={currentWellbore?.wellName || ''}
          isPreviousButtonDisabled={isPreviousButtonDisabled}
          isNextButtonDisabled={isNextButtonDisabled}
          onPreviousClick={onPreviousClick}
          onNextClick={onNextClick}
          onBackClick={onBackClick}
        />

        <FiltersBar>
          <ViewModeControl
            views={Object.values(NdsDetailedViewModes)}
            selectedView={selectedViewMode}
            onChangeView={setSelectedViewMode}
          />

          <Filters
            {...ndsAggregate}
            appliedFilters={appliedFilters}
            onChangeFilter={handleChangeFilter}
          />
        </FiltersBar>

        <DetailedViewContent>
          {selectedViewMode === NdsDetailedViewModes.RiskType && (
            <Treemap
              data={riskTypeTreemapData}
              onTileClicked={handleRickTypeTileClicked}
            />
          )}

          {selectedViewMode === NdsDetailedViewModes.Subtype && (
            <Treemap
              data={subtypeTreemapData}
              onTileClicked={handleSubtypeTileClicked}
            />
          )}

          {selectedViewMode === NdsDetailedViewModes.Table && (
            <DetailedViewTable data={filteredData} />
          )}
        </DetailedViewContent>

        <Modal
          visible={!!events.length}
          title="Event types"
          width={1000}
          onCancel={() => setEvents([])}
          footer={null}
        >
          <WellboreTableWrapper>
            <Table
              id="event-types-table"
              data={events}
              columns={[
                {
                  Header: 'Name',
                  accessor: 'name',
                  width: 'auto',
                },
                {
                  Header: 'Number of NDS events',
                  accessor: 'numberOfEvents',
                  width: '250px',
                },
              ]}
              options={{
                flex: false,
              }}
            />
          </WellboreTableWrapper>
        </Modal>
      </DetailedViewWrapper>
    </OverlayNavigation>
  );
};
