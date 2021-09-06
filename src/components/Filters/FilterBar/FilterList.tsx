import React from 'react';
import { useSelector } from 'react-redux';
import { Button } from '@cognite/cogs.js';
import { selectAllDataSets } from 'modules/datasets';
import { Flex } from 'components/Common';
import { FilterTag } from './FilterTag';
import { mimeTypes } from '../FilterSelects/utils';

type FilterListProps = {
  dataSetIds: Array<number>;
  labels: Array<{ externalId: string }>;
  searchQuery: string;
  mimeType?: string;
  onDataSetsChange: (val: Array<number>) => void;
  onLabelsChange: (externalIds: Array<string>) => void;
  onMimeTypeChange: (mimeType: Array<string>) => void;
  onQueryClear: () => void;
  onClearAll: () => void;
};

export const FilterList = ({
  dataSetIds = [],
  labels = [],
  searchQuery,
  mimeType,
  onDataSetsChange,
  onLabelsChange,
  onMimeTypeChange,
  onQueryClear,
  onClearAll,
}: FilterListProps) => {
  const allDatasets = useSelector(selectAllDataSets);

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
    if (mimeType) {
      const fileType =
        mimeTypes.find((mt) => mt.value === mimeType)?.label ?? '';
      return (
        <FilterTag
          id="filter-tag-mimetype"
          content={`File type: ${fileType}`}
          onClose={() => onMimeTypeChange([])}
        />
      );
    }
    return <span />;
  };

  return (
    <Flex row style={{ flexWrap: 'wrap' }}>
      {displayDataSets()} {displayLabels()} {displayQueryTag()}{' '}
      {displayFileTypeTag()}
      {(dataSetIds?.length || labels?.length || searchQuery?.length) && (
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
