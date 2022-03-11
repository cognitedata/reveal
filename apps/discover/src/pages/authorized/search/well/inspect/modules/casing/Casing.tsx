import React, { useMemo, useRef, useState } from 'react';

import { SearchBox } from 'components/filters';
import { FlexGrow } from 'styles/layout';

import { Separator } from '../../elements';
import { GraphTableSwitch, VIEW_MODES } from '../common/GraphTableSwitch';
import { ScrollButtons } from '../common/ScrollButtons';

import CasingGraphView from './CasingGraphView';
import CasingTableView from './CasingTableView';
import { SearchBoxWrapper, TopBarWrapper } from './elements';

const FILTER_PLACEHOLDER = 'Filter by Well/Wellbore';

export const Casing: React.FC = () => {
  const [viewMode, setViewMode] = useState<string>(VIEW_MODES.Graph);
  const [searchPhrase, setSearchPhrase] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const searchBox = useMemo(
    () => (
      <SearchBox
        placeholder={FILTER_PLACEHOLDER}
        value={searchPhrase}
        onSearch={setSearchPhrase}
      />
    ),
    [searchPhrase]
  );
  return (
    <>
      <TopBarWrapper>
        <GraphTableSwitch viewMode={viewMode} onChange={setViewMode} />
        {viewMode === VIEW_MODES.Table && (
          <>
            <Separator />
            <SearchBoxWrapper>{searchBox}</SearchBoxWrapper>
          </>
        )}
        <FlexGrow />
        {viewMode === VIEW_MODES.Graph && (
          <ScrollButtons scrollRef={scrollRef} />
        )}
      </TopBarWrapper>
      {viewMode === VIEW_MODES.Graph && (
        <CasingGraphView scrollRef={scrollRef} />
      )}
      {viewMode === VIEW_MODES.Table && (
        <CasingTableView searchPhrase={searchPhrase} />
      )}
    </>
  );
};

export default Casing;
