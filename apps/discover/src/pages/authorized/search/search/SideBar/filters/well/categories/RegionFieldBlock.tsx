import React from 'react';

import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { useWellGroupsQuery } from 'services/well/useWellQuery';

import { SegmentedControl } from '@cognite/cogs.js';

import { FilterIDs } from 'modules/wellSearch/constants';
import {
  BLOCK,
  REGION,
  FIELD,
} from 'modules/wellSearch/constantsSidebarFilters';
import {
  FilterConfig,
  FilterTypes,
  WellFilterMap,
  WellFilterMapValue,
  WellFilterOptionValue,
} from 'modules/wellSearch/types';

import { CommonFilter } from '../CommonFilter';

import { ChangeWarningModal } from './RegionFieldBlock.modal';
import { FooterRegion, FooterField } from './RegionFieldBlockFooters';

interface RegionFieldBlockProps {
  onValueChange: (
    _filterCategory: number,
    id: number,
    selectedVals: WellFilterOptionValue[],
    filterGroupName: string
  ) => void;
  selectedOptions: WellFilterMap;
  regionFieldBlockConfig: FilterConfig[];
  handleClear: (changes: Record<number, WellFilterOptionValue[]>) => void;
}
// type Tabs = 'field' | 'block';
export const RegionFieldBlock: React.FC<RegionFieldBlockProps> = ({
  onValueChange,
  selectedOptions,
  regionFieldBlockConfig,
  handleClear,
}) => {
  const [currentTab, setCurrentTab] = React.useState<string>('field');
  const { data: wellGroups } = useWellGroupsQuery();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const allRegions = new Set(Object.keys(wellGroups?.regions || []));
  const allFields = Object.keys(wellGroups?.fields || []);
  const allBlocks = Object.keys(wellGroups?.blocks || []);

  const regionOptionsToDisplay: Set<WellFilterOptionValue> = allRegions;
  let fieldOptionsToDisplay: WellFilterOptionValue[] = [];
  let blockOptionsToDisplay: WellFilterOptionValue[] = [];

  if (!wellGroups) {
    return null;
  }

  //   console.log('RegionFieldBlock filterOptions', filterOptions);
  //   console.log('RegionFieldBlock selectedOptions', selectedOptions);
  //   console.log('RegionFieldBlock regionFieldBlock', regionFieldBlockConfig);
  //   console.log('groups', wellGroups);

  const regionConfig = regionFieldBlockConfig.find(
    (category) => category.name === REGION
  );
  const fieldConfig = regionFieldBlockConfig.find(
    (category) => category.name === FIELD
  );
  const blockConfig = regionFieldBlockConfig.find(
    (category) => category.name === BLOCK
  );

  // **
  // structure ONE
  // **
  //   const allRegions = Object.keys(wellGroups);
  //   const allFields = Object.keys(wellGroups).flatMap((region) => {
  //     return Object.keys(wellGroups[region]);
  //   });
  //   const allBlocks = Object.keys(wellGroups).flatMap((region) => {
  //     return Object.values(wellGroups[region]).flatMap((blocks) => blocks);
  //   });
  //   const regionOptionsToDisplay: WellFilterOptionValue[] = allRegions;
  //   let fieldOptionsToDisplay: WellFilterOptionValue[] = [];
  //   let blockOptionsToDisplay: WellFilterOptionValue[] = [];

  //   if (!regionConfig || !fieldConfig) {
  //     console.error('Broken well filter configs');
  //     return null;
  //   }

  //   const selectedRegions: WellFilterMapValue = selectedOptions[regionConfig?.id];
  //   const selectedFields: WellFilterMapValue = selectedOptions[fieldConfig?.id];
  //   console.log('selectedRegions', selectedRegions);

  //   // check to see if we need to filter the FIELD list
  //   if (isArray(selectedRegions) && selectedRegions.length > 0) {
  //     fieldOptionsToDisplay = selectedRegions.flatMap((region) => {
  //       //   console.log('selectedRegion', region);
  //       if (isString(region)) {
  //         return Object.keys(wellGroups[region]);
  //       }

  //       return [];
  //     });
  //     // console.log('fields', fields);
  //   } else {
  //     fieldOptionsToDisplay = allFields;
  //   }

  //   // check to see if we need to filter the BLOCK list
  //   if (isArray(selectedFields) && selectedFields.length > 0) {
  //     blockOptionsToDisplay = selectedFields.flatMap((field) => {
  //     //   console.log('selectedFields', field);
  //       if (isString(field)) {
  //           const blocksInField = Object.values(wellGroups[field])
  //         return Object.values(wellGroups[field]).flatMap((blocks) => blocks);
  //       }
  //       return [];
  //     });
  //   } else {
  //     blockOptionsToDisplay = allBlocks;
  //   }

  // **
  // structure TWO
  // **

  const selectedRegions: WellFilterMapValue = selectedOptions[FilterIDs.REGION];
  const selectedFields: WellFilterMapValue = selectedOptions[FilterIDs.FIELD];
  //   console.log('selectedRegions', selectedRegions);

  // check to see if we need to filter the FIELD list
  if (isArray(selectedRegions) && selectedRegions.length > 0) {
    fieldOptionsToDisplay = selectedRegions.flatMap((region) => {
      //   console.log('selectedRegion', region);
      return allFields.filter((field) => {
        return wellGroups.fields[field].region === region;
      });
    });
    // console.log('fields', fields);
  } else {
    fieldOptionsToDisplay = allFields;
  }

  // check to see if we need to filter the BLOCK list
  if (isArray(selectedFields) && selectedFields.length > 0) {
    blockOptionsToDisplay = selectedFields.flatMap((field) => {
      // console.log('selectedFields', field);
      return allBlocks.filter((block) => {
        const matchingField = wellGroups.blocks[block].field === field;

        // also add the matching regions to the selection
        if (matchingField) {
          const possibleRegion = wellGroups.blocks[block].region;
          if (possibleRegion) {
            // regionOptionsToDisplay.add(possibleRegion);
          }
        }
        return matchingField;
      });
    });
  } else {
    blockOptionsToDisplay = allBlocks;
  }

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const toggleTab = () => {
    setCurrentTab(currentTab === 'field' ? 'block' : 'field');
  };

  const clearSettingsAndChangeTab = () => {
    toggleTab();

    // unset all filters on tab change
    handleClear({
      [FilterIDs.FIELD]: [],
      [FilterIDs.BLOCK]: [],
    });
  };

  const handleAccept = () => {
    setIsModalOpen(false);
    clearSettingsAndChangeTab();
  };

  const onTabClick = (tab: string) => {
    if (tab === currentTab) {
      return;
    }

    // we don't need the modal if there are no current selections
    if (currentTab === 'field') {
      if (isEmpty(selectedFields)) {
        toggleTab();
        return;
      }
    }
    if (currentTab === 'block') {
      if (isEmpty(selectedOptions[FilterIDs.BLOCK])) {
        toggleTab();
        return;
      }
    }

    setIsModalOpen(true);
  };

  const updateRegionSelection = (selectedVals: WellFilterOptionValue[]) => {
    onValueChange(FilterIDs.REGION, FilterIDs.REGION, selectedVals, REGION);
  };

  const updateFieldSelection = (selectedVals: WellFilterOptionValue[]) => {
    onValueChange(FilterIDs.FIELD, FilterIDs.FIELD, selectedVals, FIELD);
  };

  // we don't need to segment if both types are not enabled
  const showSegmentControl = fieldConfig && blockConfig;

  const showFieldFilter = currentTab === 'field' && fieldConfig;
  const showBlockFilter = currentTab === 'block' && blockConfig;

  return (
    <>
      {regionConfig && (
        <CommonFilter
          key={`filter-${FilterIDs.REGION}`}
          filterConfig={{
            id: FilterIDs.REGION,
            name: REGION,
            type: FilterTypes.MULTISELECT,
          }}
          onValueChange={(_id: number, selectedVals: WellFilterOptionValue[]) =>
            updateRegionSelection(selectedVals)
          }
          options={Array.from(regionOptionsToDisplay)}
          selectedOptions={selectedRegions}
          displayFilterTitle
          footer={isEmpty(selectedFields) ? undefined : FooterRegion}
        />
      )}

      {showSegmentControl && (
        <SegmentedControl
          currentKey={currentTab}
          onButtonClicked={onTabClick}
          fullWidth
        >
          <SegmentedControl.Button key="field">Field</SegmentedControl.Button>
          <SegmentedControl.Button key="block">Block</SegmentedControl.Button>
        </SegmentedControl>
      )}

      {showFieldFilter && (
        <CommonFilter
          key={`filter-${FilterIDs.FIELD}`}
          filterConfig={{
            id: FilterIDs.FIELD,
            name: FIELD,
            type: FilterTypes.MULTISELECT,
          }}
          onValueChange={(
            _id: number,
            selectedVals: WellFilterOptionValue[]
          ) => {
            updateFieldSelection(selectedVals);
          }}
          options={fieldOptionsToDisplay}
          selectedOptions={selectedFields}
          displayFilterTitle={!showSegmentControl}
          footer={isEmpty(selectedRegions) ? undefined : FooterField}
        />
      )}

      {showBlockFilter && (
        <CommonFilter
          key={`filter-${FilterIDs.BLOCK}`}
          filterConfig={{
            id: FilterIDs.BLOCK,
            name: BLOCK,
            type: FilterTypes.MULTISELECT,
          }}
          onValueChange={(
            id: number,
            selectedVals: WellFilterOptionValue[]
          ) => {
            onValueChange(FilterIDs.BLOCK, id, selectedVals, BLOCK);
          }}
          options={blockOptionsToDisplay}
          selectedOptions={selectedOptions[FilterIDs.BLOCK]}
          displayFilterTitle={!showSegmentControl}
        />
      )}

      {isModalOpen && (
        <ChangeWarningModal
          handleClose={handleClose}
          handleAccept={handleAccept}
        />
      )}
    </>
  );
};
