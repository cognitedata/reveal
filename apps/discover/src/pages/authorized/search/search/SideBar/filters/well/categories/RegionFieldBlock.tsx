import React from 'react';

import isEmpty from 'lodash/isEmpty';
import { useWellGroupsQuery } from 'services/well/useWellQuery';

import { MULTISELECT_NO_RESULTS } from 'components/filters/MultiSelect/constants';
import { FilterIDs } from 'modules/wellSearch/constants';
import {
  BLOCK,
  REGION,
  FIELD,
} from 'modules/wellSearch/constantsSidebarFilters';
import { useRegionsFieldsBlocksRelationship } from 'modules/wellSearch/hooks/useRegionsFieldsBlocksRelationship';
import {
  FilterConfig,
  FilterTypes,
  WellFilterMap,
  WellFilterMapValue,
  WellFilterOptionValue,
} from 'modules/wellSearch/types';

import { CommonFilter } from '../CommonFilter';

import { restFilters } from './utils';

interface RegionFieldBlockProps {
  onValueChange: (
    _filterCategory: number,
    id: number,
    selectedVals: WellFilterOptionValue[],
    filterGroupName: string
  ) => void;
  selectedOptions: WellFilterMap;
  regionFieldBlockConfig: FilterConfig[];
}

export const RegionFieldBlock: React.FC<RegionFieldBlockProps> = ({
  onValueChange,
  selectedOptions,
  regionFieldBlockConfig,
}) => {
  const { data: wellGroups } = useWellGroupsQuery();

  const getRelationship = useRegionsFieldsBlocksRelationship(
    wellGroups,
    selectedOptions
  );

  const selectedRegions: WellFilterMapValue = selectedOptions[FilterIDs.REGION];
  const selectedFields: WellFilterMapValue = selectedOptions[FilterIDs.FIELD];
  const selectedBlocks: WellFilterMapValue = selectedOptions[FilterIDs.BLOCK];

  const allRegions = Object.keys(wellGroups?.regions || []);
  const allFields = Object.keys(wellGroups?.fields || []);
  const allBlocks = Object.keys(wellGroups?.blocks || []);

  const [regionOptionsToDisplay, setRegion] = React.useState<string[]>([]);
  const [fieldOptionsToDisplay, setField] = React.useState<string[]>([]);
  const [blockOptionsToDisplay, setBlock] = React.useState<string[]>([]);

  const hasRegionOrFieldApplied =
    selectedRegions?.length > 0 || selectedFields?.length > 0;
  const hasRegionOrBlockApplied =
    selectedRegions?.length > 0 || selectedBlocks?.length > 0;
  const hasFieldOrBlockApplied =
    selectedFields?.length > 0 || selectedBlocks?.length > 0;

  const regionConfig = regionFieldBlockConfig.find(
    (category) => category.name === REGION
  );
  const fieldConfig = regionFieldBlockConfig.find(
    (category) => category.name === FIELD
  );
  const blockConfig = regionFieldBlockConfig.find(
    (category) => category.name === BLOCK
  );

  React.useEffect(() => {
    if (!regionConfig) return;

    const {
      [FilterIDs.FIELD]: updatingField,
      [FilterIDs.BLOCK]: updatingBlock,
    } = getRelationship(FilterIDs.REGION);

    setField(updatingField);
    setBlock(updatingBlock);

    // Triggered on 'regions'-field updates
  }, [selectedRegions, regionConfig]);

  React.useEffect(() => {
    if (!fieldConfig) return;

    const {
      [FilterIDs.REGION]: updatingRegion,
      [FilterIDs.BLOCK]: updatingBlock,
    } = getRelationship(FilterIDs.FIELD);

    setRegion(updatingRegion);
    setBlock(updatingBlock);

    // Triggered on 'fields'-field updates
  }, [selectedFields, fieldConfig]);

  React.useEffect(() => {
    if (!blockConfig) return;

    const {
      [FilterIDs.REGION]: updatingRegion,
      [FilterIDs.FIELD]: updatingField,
    } = getRelationship(FilterIDs.BLOCK);

    setRegion(updatingRegion);
    setField(updatingField);

    // Triggered on 'blocks'-field updates
  }, [selectedBlocks, blockConfig]);

  const updateRegionSelection = (selectedVals: WellFilterOptionValue[]) => {
    onValueChange(FilterIDs.REGION, FilterIDs.REGION, selectedVals, REGION);
  };

  const updateFieldSelection = (selectedVals: WellFilterOptionValue[]) => {
    onValueChange(FilterIDs.FIELD, FilterIDs.FIELD, selectedVals, FIELD);
  };

  const updateBlockSelection = (
    selectedVals: WellFilterOptionValue[],
    id: number
  ) => {
    onValueChange(FilterIDs.BLOCK, id, selectedVals, BLOCK);
  };

  if (!wellGroups) {
    return null;
  }

  return (
    <>
      {regionConfig && (
        <CommonFilter
          key={`filter-${FilterIDs.REGION}`}
          filterConfig={{
            id: FilterIDs.REGION,
            name: REGION,
            type: FilterTypes.MULTISELECT_GROUP,
          }}
          onValueChange={(_id: number, selectedVals: WellFilterOptionValue[]) =>
            updateRegionSelection(selectedVals)
          }
          options={Array.from(regionOptionsToDisplay)}
          groupedOptions={[
            {
              label: 'Related regions to your previous selections',
              options:
                regionOptionsToDisplay.length === 0 && hasFieldOrBlockApplied
                  ? [MULTISELECT_NO_RESULTS]
                  : regionOptionsToDisplay,
            },
            {
              label: isEmpty(regionOptionsToDisplay)
                ? 'All regions'
                : 'Remaining regions',
              options: restFilters(allRegions, regionOptionsToDisplay),
            },
          ]}
          selectedOptions={selectedRegions}
          displayFilterTitle
        />
      )}

      {fieldConfig && (
        <CommonFilter
          key={`filter-${FilterIDs.FIELD}`}
          filterConfig={{
            id: FilterIDs.FIELD,
            name: FIELD,
            type: FilterTypes.MULTISELECT_GROUP,
          }}
          onValueChange={(
            _id: number,
            selectedVals: WellFilterOptionValue[]
          ) => {
            updateFieldSelection(selectedVals);
          }}
          options={fieldOptionsToDisplay}
          groupedOptions={[
            {
              label: 'Related fields to your previous selections',
              options:
                fieldOptionsToDisplay.length === 0 && hasRegionOrBlockApplied
                  ? [MULTISELECT_NO_RESULTS]
                  : fieldOptionsToDisplay,
            },
            {
              label: isEmpty(fieldOptionsToDisplay)
                ? 'All fields'
                : 'Remaining fields',
              options: restFilters(allFields, fieldOptionsToDisplay),
            },
          ]}
          selectedOptions={selectedFields}
        />
      )}

      {blockConfig && (
        <CommonFilter
          key={`filter-${FilterIDs.BLOCK}`}
          filterConfig={{
            id: FilterIDs.BLOCK,
            name: BLOCK,
            type: FilterTypes.MULTISELECT_GROUP,
          }}
          onValueChange={(
            id: number,
            selectedVals: WellFilterOptionValue[]
          ) => {
            updateBlockSelection(selectedVals, id);
          }}
          groupedOptions={[
            {
              label: 'Related blocks to your previous selections',
              options:
                blockOptionsToDisplay.length === 0 && hasRegionOrFieldApplied
                  ? [MULTISELECT_NO_RESULTS]
                  : blockOptionsToDisplay,
            },
            {
              label: isEmpty(blockOptionsToDisplay)
                ? 'All blocks'
                : 'Remaining blocks',
              options: restFilters(allBlocks, blockOptionsToDisplay),
            },
          ]}
          options={blockOptionsToDisplay}
          selectedOptions={selectedBlocks}
        />
      )}
    </>
  );
};
