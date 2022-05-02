import React, { useEffect } from 'react';
import { useQueryClient } from 'react-query';

import { useQuerySavedSearchCurrent } from 'services/savedSearches/useSavedSearchQuery';

import EmptyState from 'components/EmptyState';
import { NO_RESULTS_TEXT } from 'components/EmptyState/constants';
import { SAVED_SEARCHES_QUERY_KEY } from 'constants/react-query';
import { useSurveys } from 'modules/seismicSearch/hooks';

import { ResultTable } from './ResultTable';

export const SeismicResults: React.FC = () => {
  const { isLoading, error, data } = useSurveys();
  const queryClient = useQueryClient();

  const resultData = data;
  const { data: currentSavedSearch } = useQuerySavedSearchCurrent();

  useEffect(() => {
    queryClient.invalidateQueries(SAVED_SEARCHES_QUERY_KEY);
  }, [currentSavedSearch]);

  const hasNoData = resultData && resultData.length === 0;
  const isInLoadingState = isLoading && hasNoData;

  if (error) {
    // console.log('Seismic state: error');
    return <div>Error fetching seismic...</div>;
  }

  if (hasNoData || !resultData) {
    // console.log('Seismic state: loading');
    return (
      <EmptyState isLoading={isInLoadingState} emptyTitle={NO_RESULTS_TEXT} />
    );
  }

  // console.log('Seismic main render');

  return <ResultTable result={resultData} />;
};
