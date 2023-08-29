import React, { useMemo } from 'react';

import {
  getTableColumns,
  SubCellMatchingLabels,
  SummaryCardWrapper,
  Table,
} from '@data-exploration/components';
import { useSequencesMetadataColumns } from '@data-exploration/containers';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { useUniqueCdfItems } from '@data-exploration-components/hooks';
import { ColumnDef } from '@tanstack/react-table';
import uniqBy from 'lodash/uniqBy';

import { Asset, Sequence } from '@cognite/sdk';

import {
  EMPTY_OBJECT,
  getHiddenColumns,
  InternalSequenceFilters,
  isObjectEmpty,
  isSummaryCardDataCountExceed,
  useDeepMemo,
  useGetSearchConfigFromLocalStorage,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  useSequenceSearchResultWithMatchingLabelsQuery,
  InternalSequenceDataWithMatchingLabels,
  useRelatedSequenceQuery,
} from '@data-exploration-lib/domain-layer';

export const SequenceSummary = ({
  query = '',
  filter = EMPTY_OBJECT,
  onAllResultsClick,
  onRowClick,
  onRootAssetClick,
  isAdvancedFiltersEnabled = false,
  showAllResultsWithEmptyFilters = false,
  selectedResourceExternalId: resourceExternalId,
  annotationIds = [],
}: {
  query?: string;
  filter?: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: Sequence) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  isAdvancedFiltersEnabled?: boolean;
  showAllResultsWithEmptyFilters?: boolean;
  selectedResourceExternalId?: string;
  annotationIds?: number[];
}) => {
  const isQueryEnable = isObjectEmpty(filter as any)
    ? showAllResultsWithEmptyFilters
    : true;

  const { data: annotationList = [] } = useUniqueCdfItems<Sequence>(
    'sequences',
    annotationIds.map((id) => ({ id })),
    true
  );

  const isAnnotationCountExceed = isSummaryCardDataCountExceed(
    annotationList.length
  );

  const sequenceSearchConfig = useGetSearchConfigFromLocalStorage('sequence');

  const { isLoading, data: sequences } =
    useSequenceSearchResultWithMatchingLabelsQuery(
      {
        filter,
        query,
      },
      sequenceSearchConfig,
      { enabled: isQueryEnable && !isAnnotationCountExceed }
    );

  const isSequencesCountExceed = isSummaryCardDataCountExceed(
    sequences.length + annotationList.length
  );

  const { data: relatedSequence, isLoading: isRelatedSequenceLoading } =
    useRelatedSequenceQuery({
      resourceExternalId,
      enabled: !isSequencesCountExceed,
    });

  const mergeData = useDeepMemo(
    () => uniqBy([...annotationList, ...sequences, ...relatedSequence], 'id'),
    [annotationList, sequences, relatedSequence]
  );
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const { metadataColumns, setMetadataKeyQuery } =
    useSequencesMetadataColumns();

  const columns = useMemo(
    () =>
      [
        tableColumns.name(),
        tableColumns.description(),
        tableColumns.externalId(),
        tableColumns.columns,
        tableColumns.lastUpdatedTime,
        tableColumns.created,
        tableColumns.id(query),
        tableColumns.rootAsset(onRootAssetClick),
        tableColumns.dataSet,
        ...metadataColumns,
      ] as ColumnDef<Sequence>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );

  const hiddenColumns = getHiddenColumns(columns, ['name', 'description']);

  const isDataLoading = isLoading && isQueryEnable && !isAnnotationCountExceed;
  const isRelatedDataLoading =
    isRelatedSequenceLoading && !isSequencesCountExceed;

  return (
    <SummaryCardWrapper data-testid="sequence-summary">
      <Table<InternalSequenceDataWithMatchingLabels>
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(mergeData)}
        columnSelectionLimit={2}
        id="sequence-summary-table"
        isDataLoading={isDataLoading || isRelatedDataLoading}
        tableHeaders={
          <SummaryHeader
            icon="Sequences"
            title={t('SEQUENCE', 'Sequence')}
            onAllResultsClick={onAllResultsClick}
          />
        }
        enableColumnResizing={false}
        onRowClick={onRowClick}
        renderCellSubComponent={
          isAdvancedFiltersEnabled ? SubCellMatchingLabels : undefined
        }
        query={query}
        onChangeSearchInput={setMetadataKeyQuery}
      />
    </SummaryCardWrapper>
  );
};
