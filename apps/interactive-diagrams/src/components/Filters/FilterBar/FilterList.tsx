import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@cognite/cogs.js';
import { selectAllDataSets } from 'modules/datasets';
import { Flex } from 'components/Common';
import { StatusType, approvalDetails } from 'components/Filters';
import { FilterTag } from './FilterTag';
import { mimeTypes } from '../FilterSelects';

type FilterListProps = {
  dataSetIds: Array<number>;
  labels: Array<{ externalId: string }>;
  searchQuery: string;
  mimeType?: Array<string>;
  status?: Array<StatusType>;
  onDataSetsChange: (val: Array<number>) => void;
  onLabelsChange: (externalIds: Array<string>) => void;
  onMimeTypeChange: (mimeType: Array<string>) => void;
  onStatusChange?: (status: Array<StatusType>) => void;
  onQueryClear: () => void;
  onClearAll: () => void;
};

export const FilterList = ({
  dataSetIds = [],
  labels = [],
  searchQuery,
  mimeType,
  status,
  onDataSetsChange,
  onLabelsChange,
  onMimeTypeChange,
  onStatusChange,
  onQueryClear,
  onClearAll,
}: FilterListProps) => {
  const allDatasets = useSelector(selectAllDataSets);
  const areFiltersSelected = Boolean(
    dataSetIds?.length ||
      labels?.length ||
      searchQuery?.length ||
      status?.length
  );

  const displayDataSets = () => {
    if (dataSetIds?.length) {
      return dataSetIds.map((dsId) => {
        const dataset = allDatasets.find((ds) => ds.id === dsId);
        return (
          <FilterTag
            key={`filter-tag-${dsId}-ds`}
            onClose={() =>
              onDataSetsChange(dataSetIds.filter((id) => id !== dsId))
            }
            id={dsId}
            content={`Data set: ${
              dataset?.name ?? dataset?.externalId ?? dsId
            }`}
          />
        );
      });
    }
    return <span />;
  };

  const displayLabels = () => {
    if (labels?.length) {
      return labels.map((label) => (
        <FilterTag
          key={`filter-tag-${label.externalId}-label`}
          id={label.externalId}
          content={`Label: ${label.externalId}`}
          onClose={() =>
            onLabelsChange(
              labels
                .filter((curLabel) => curLabel.externalId !== label.externalId)
                .map((curLabel) => curLabel.externalId)
            )
          }
        />
      ));
    }
    return <span />;
  };

  const displayQueryTag = () => {
    if (searchQuery)
      return (
        <FilterTag
          id="search-query"
          content={`Name: ${searchQuery}`}
          onClose={onQueryClear}
        />
      );
    return <span />;
  };

  const displayFileTypeTag = () => {
    if (mimeType?.length) {
      return mimeType?.map((mT) => {
        const fileType = mimeTypes.find((mt) => mt.value === mT)?.label ?? '';
        return (
          <FilterTag
            id={`filter-tag-mimetype-${fileType}`}
            key={`filter-tag-${fileType}-mimetype`}
            content={`File type: ${fileType}`}
            onClose={() => onMimeTypeChange([])}
          />
        );
      });
    }
    return <span />;
  };

  const displayStatusTag = () => {
    if (status?.length) {
      return status?.map((statusType: StatusType) => {
        const statusLabel =
          approvalDetails[statusType]?.label ?? approvalDetails.unknown.label;
        return (
          <FilterTag
            key={`filter-tag-${statusType}-status`}
            onClose={() => {
              if (onStatusChange)
                onStatusChange(
                  status?.filter(
                    (statusItem: StatusType) => statusType !== statusItem
                  )
                );
            }}
            id={statusType}
            content={`Status: ${statusLabel}`}
          />
        );
      });
    }
    return <span />;
  };

  return (
    <Flex row style={{ flexWrap: 'wrap' }}>
      {displayDataSets()} {displayLabels()} {displayQueryTag()}{' '}
      {displayFileTypeTag()} {displayStatusTag()}
      {areFiltersSelected && (
        <Button
          icon="Close"
          type="ghost"
          size="small"
          iconPlacement="left"
          onClick={onClearAll}
        >
          Clear all
        </Button>
      )}
    </Flex>
  );
};
