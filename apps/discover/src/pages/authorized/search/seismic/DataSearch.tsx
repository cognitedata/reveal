import * as React from 'react';
import { useDispatch } from 'react-redux';

import { TS_FIX_ME } from 'core';

import {
  setSelectedSliceId,
  setSeismicCompareIsOpen,
} from 'modules/seismicSearch/actions';
import { useSeismic } from 'modules/seismicSearch/selectors';

import {
  SearchResultContainer,
  ContentWrapper,
  SearchWrapper,
} from '../elements';

import { SeismicResults } from './result';
import SearchHistory from './search-history';
import SeismicModal from './seismic-image/SeismicModalComparer';

const SEISMIC_RESULT_TEST_ID = 'seismic-results';

export const Seismic: React.FC = () => {
  const dispatch = useDispatch();
  const seismic = useSeismic();
  const { sliceCollection, isSeismicCompareOpen } = seismic;

  const handleCloseSeismicModal = () => {
    dispatch(setSeismicCompareIsOpen(false));
  };

  const handleOnSliceSelect = (slice: TS_FIX_ME) => {
    dispatch(setSeismicCompareIsOpen(true));
    dispatch(setSelectedSliceId(slice.id));
  };

  return (
    <>
      <SearchWrapper>
        <SearchResultContainer>
          <ContentWrapper data-testid={SEISMIC_RESULT_TEST_ID}>
            <SeismicResults />
          </ContentWrapper>
        </SearchResultContainer>
      </SearchWrapper>

      {isSeismicCompareOpen && (
        <SeismicModal
          isOpen={isSeismicCompareOpen}
          onClose={handleCloseSeismicModal}
        />
      )}
      {sliceCollection.length > 0 && (
        <SearchHistory
          sliceSearches={sliceCollection}
          isVisible={sliceCollection.length > 0}
          handleOnItemClick={handleOnSliceSelect}
        />
      )}
    </>
  );
};

export default Seismic;
