import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Table, RowProps } from 'components/Tablev3';
import { DEFAULT_PAGE_SIZE } from 'constants/app';
import { stopSearching } from 'modules/search/actions';
import { useSearchState } from 'modules/search/selectors';
import {
  useSelectedSurveys,
  useSelectedFiles,
} from 'modules/seismicSearch/selectors';
import {
  SeismicState,
  SeismicSurveyContainer,
} from 'modules/seismicSearch/types';
import { toggleSurveySelected } from 'modules/seismicSearch/utils';
import { SearchTableResultActionContainer } from 'pages/authorized/search/elements';
import mainPalette from 'styles/default.palette';

import { SearchBreadcrumb } from '../../common/searchResult';
import { useZoomToSurvey } from '../utils/zoomToSurvey';

import { ResultSurveyFiles } from './ResultSurveyFiles';
import { ViewInSelector } from './ViewIn';

interface Props {
  result: SeismicState['dataResult'];
}

export const ResultTable: React.FC<Props> = ({ result }) => {
  const dispatch = useDispatch();
  const { isSearching } = useSearchState();
  const selectedSurveys = useSelectedSurveys();
  const selectedFiles = useSelectedFiles();
  const zoomToSurvey = useZoomToSurvey();

  useEffect(() => {
    dispatch(stopSearching());
  }, [isSearching]);

  // console.log('Generating seismic table from:', result);

  const columns = [
    {
      Header: 'Survey name',
      accessor: 'survey',
      width: '1fr',
    },
  ];

  const data = result;

  const handleDoubleClick = (row: RowProps) => {
    const survey = row.original as SeismicSurveyContainer;
    zoomToSurvey(survey);
  };

  const handleRowClick = (row: RowProps) => {
    const survey = row.original as SeismicSurveyContainer;

    dispatch(toggleSurveySelected(survey.id, selectedSurveys));
  };

  const renderRowSubComponent = ({ row }: { row: RowProps }) => {
    const survey = row.original as SeismicSurveyContainer;

    return <ResultSurveyFiles survey={survey} />;
  };

  const expandedSearchResults = selectedSurveys.reduce((acc, id) => {
    return {
      [id]: true,
      ...acc,
    };
  }, {});

  const options = {
    expandable: true,
    checkable: false,
    rowOptions: {
      selected: selectedFiles[0],
      selectedStyle: mainPalette.gray,
    },
    pagination: {
      enabled: true,
      pageSize: DEFAULT_PAGE_SIZE,
    },
    flex: false,
    height: '100%',
  };

  const seismicStats = [
    {
      totalResults: (data || []).length,
      currentHits: (data || []).length,
    },
  ];

  return (
    <>
      <SearchTableResultActionContainer>
        <SearchBreadcrumb stats={seismicStats} />
      </SearchTableResultActionContainer>
      <Table<SeismicSurveyContainer>
        scrollTable
        id="seismic-result-table"
        data={data}
        columns={columns}
        hideHeaders
        handleDoubleClick={handleDoubleClick}
        handleRowClick={handleRowClick}
        expandedIds={expandedSearchResults}
        options={options}
        renderRowSubComponent={renderRowSubComponent}
      />
      <ViewInSelector />
    </>
  );
};
