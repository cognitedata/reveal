import React, { useRef, useState } from 'react';

import EmptyState from 'components/EmptyState';
import { SearchBox } from 'components/Filters';
import { MultiStateToggle } from 'components/MultiStateToggle';
import { FlexGrow } from 'styles/layout';

import { Separator } from '../../elements';
import { ScrollButtons } from '../common/ScrollButtons';
import { DEFAULT_ACTIVE_VIEW_MODE, VIEW_MODES } from '../events/Npt/constants';
import { ViewModes } from '../events/Npt/types';

import {
  DEFAULT_ACTIVE_SIDE_MODE,
  SEARCH_FILTER_PLACEHOLDER,
  SideModes,
} from './constants';
import { SearchBoxWrapper, TopBarWrapper } from './elements';
import { CasingsGraph } from './Graph';
import { useCasingsData } from './hooks/useCasingsData';
import { CasingsTable } from './Table';

export const Casing: React.FC = () => {
  const { data, isLoading, isNptEventsLoading, isNdsEventsLoading } =
    useCasingsData();

  const [viewMode, setViewMode] = useState<ViewModes>(DEFAULT_ACTIVE_VIEW_MODE);
  const [activeSideMode, setActiveSideMode] = useState<SideModes>(
    DEFAULT_ACTIVE_SIDE_MODE
  );

  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <TopBarWrapper>
        <MultiStateToggle<ViewModes>
          activeOption={viewMode}
          options={VIEW_MODES}
          onChange={setViewMode}
        />

        {viewMode === VIEW_MODES.Graph && (
          <MultiStateToggle<SideModes>
            activeOption={activeSideMode}
            options={SideModes}
            onChange={setActiveSideMode}
          />
        )}

        {viewMode === VIEW_MODES.Table && (
          <>
            <Separator />
            <SearchBoxWrapper>
              <SearchBox
                placeholder={SEARCH_FILTER_PLACEHOLDER}
                value={searchPhrase}
                onSearch={setSearchPhrase}
              />
            </SearchBoxWrapper>
          </>
        )}

        <FlexGrow />

        {viewMode === VIEW_MODES.Graph && (
          <ScrollButtons scrollRef={scrollRef} />
        )}
      </TopBarWrapper>

      {viewMode === VIEW_MODES.Graph && (
        <CasingsGraph
          data={data}
          scrollRef={scrollRef}
          isNptEventsLoading={isNptEventsLoading}
          isNdsEventsLoading={isNdsEventsLoading}
          showBothSides={activeSideMode === SideModes.BothSides}
        />
      )}

      {viewMode === VIEW_MODES.Table && (
        <CasingsTable data={data} searchPhrase={searchPhrase} />
      )}
    </>
  );
};

export default Casing;
