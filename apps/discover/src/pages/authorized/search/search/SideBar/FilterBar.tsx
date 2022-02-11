import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { setActivePanel } from 'modules/resultPanel/actions';
import {
  useFilterBarIsOpen,
  useFilterCategory,
} from 'modules/sidebar/selectors';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';

import { PrefetchFilterOptions } from './components/PrefetchFilterOptions';
import { MS_TRANSITION_TIME } from './constants';
import { FilterBarContainer } from './elements';
import {
  LandingFilter,
  DocumentFilter,
  SeismicFilter,
  WellsFilter,
} from './filters';

export const FilterBar: React.FC = () => {
  const isOpen = useFilterBarIsOpen();
  const category = useFilterCategory();
  const dispatch = useDispatch();
  const { data: wellConfig } = useWellConfig();

  useEffect(() => {
    setTimeout(() => {
      // Trigger a resize for the map to change width after transition has finished
      window.dispatchEvent(new Event('resize'));
    }, MS_TRANSITION_TIME);
  }, [isOpen]);

  useEffect(() => {
    if (category === 'landing') {
      dispatch(setActivePanel(undefined));
    }
  }, [category]);

  const renderCategoryPage = () => {
    if (category === 'documents') {
      return <DocumentFilter />;
    }
    if (category === 'seismic') {
      return <SeismicFilter />;
    }
    if (category === 'wells') {
      return <WellsFilter />;
    }
    return <LandingFilter />;
  };

  return (
    <FilterBarContainer isOpen={isOpen}>
      {wellConfig?.disabled !== true && <PrefetchFilterOptions />}
      {renderCategoryPage()}
    </FilterBarContainer>
  );
};
