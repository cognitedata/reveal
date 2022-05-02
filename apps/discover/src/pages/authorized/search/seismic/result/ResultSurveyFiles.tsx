import React from 'react';
import { useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { Row } from 'react-table';

import compact from 'lodash/compact';

import { RowProps, Table } from 'components/Tablev3';
import {
  useSurvey,
  useSurveys,
  updateOneSurveyInList,
} from 'modules/seismicSearch/hooks';
import { useSeismicConfig } from 'modules/seismicSearch/hooks/useSeismicConfig';
import { useSelectedFiles } from 'modules/seismicSearch/selectors';
import {
  SeismicFile,
  SeismicSurveyContainer,
} from 'modules/seismicSearch/types';
import {
  getSafeMetadataName,
  toggleFileSelected,
} from 'modules/seismicSearch/utils';

import { useZoomToSurvey } from '../utils/zoomToSurvey';

interface ColumnHeader {
  Header?: string;
  width?: string | number;
  maxWidth?: string | null;
  accessor?: string;
}
interface Props {
  survey: SeismicSurveyContainer;
}
export const ResultSurveyFiles: React.FC<Props> = ({ survey }) => {
  const { data: config } = useSeismicConfig();
  const dispatch = useDispatch();
  const selectedFiles = useSelectedFiles();
  const zoomToSurvey = useZoomToSurvey();
  const queryClient = useQueryClient();

  const { data: surveyData } = useSurvey(survey.id);
  const { data: allSurveyData } = useSurveys();

  const nestedOptions = {
    checkable: true,
    indentRow: true,
    flex: false,
    hideScrollbars: true,
    width: '100%',
  };

  const surveyColumns = React.useMemo(() => {
    let processedSurveyColumns: ColumnHeader[] = [];
    if (config && config.metadata) {
      processedSurveyColumns = compact(
        Object.keys(config.metadata).map((key) => {
          if (config?.metadata && config.metadata[key].display) {
            const accessor =
              config.metadata[key].source !== undefined
                ? `${config.metadata[key].source}${key}`
                : `metadata.${getSafeMetadataName(key)}`;

            return {
              Header: config.metadata[key].displayName,
              width: config.metadata[key].width
                ? `${config.metadata[key].width}px`
                : '140px',
              maxWidth: '0.5fr',
              accessor,
            };
          }
          return {};
        })
      );
    }

    if (processedSurveyColumns.length === 0) {
      processedSurveyColumns = [
        {
          Header: 'Name',
          accessor: 'dataSetName',
          width: '140px',
          maxWidth: '0.5fr',
        },
      ];
    }

    return processedSurveyColumns;
  }, [config, selectedFiles]);

  React.useEffect(() => {
    if (surveyData && 'survey' in surveyData) {
      if (allSurveyData) {
        updateOneSurveyInList(queryClient, surveyData, allSurveyData);
      }

      zoomToSurvey(surveyData.survey);
    }
  }, [surveyData]);

  const doRowClickAction = (file: SeismicFile) => {
    dispatch(toggleFileSelected(file, selectedFiles));
  };

  const handleSubRowClick = (row: Row) => {
    doRowClickAction(row.original as SeismicFile);
  };

  const handleRowSelect = (fileSelected: RowProps<SeismicFile>) => {
    doRowClickAction(fileSelected.original);
  };

  const selectedIds = selectedFiles.reduce((acc, { fileId }) => {
    return {
      [fileId]: true,
      ...acc,
    };
  }, {});

  // might be nicer to just include the surveyId from the normalization level
  // or even the api response:
  const tableData = survey.surveys.map((file) => {
    return {
      ...file,
      surveyId: survey.id,
    };
  });
  return (
    <Table<SeismicFile>
      scrollTable
      id="seismic-result-table-survey"
      data={tableData}
      columns={surveyColumns}
      handleRowClick={handleSubRowClick}
      handleRowSelect={handleRowSelect}
      options={nestedOptions}
      selectedIds={selectedIds}
    />
  );
};
