import React from 'react';

import { MultiSelect } from '@data-exploration/components';

import { OptionType, Tooltip } from '@cognite/cogs.js';

import {
  DATA_EXPLORATION_COMPONENT,
  ResourceType,
  useMetrics,
  useTranslation,
  zIndex,
} from '@data-exploration-lib/core';
import { useAssetsUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';

import { FilterFacetTitle } from '../FilterFacetTitle';

type OptionValue = { label?: string | undefined; value: string }[] | undefined;
export const LabelFilterV2 = ({
  resourceType,
  value,
  setValue,
  addNilOption,
}: {
  resourceType: ResourceType;
  value: OptionValue;
  setValue: (newValue: OptionValue) => void;
  addNilOption?: boolean;
}) => {
  const { t } = useTranslation();
  const trackUsage = useMetrics();

  const allowLabels = resourceType === 'asset' || resourceType === 'file';

  const {
    data: labels = [],
    isError,
    isFetched,
  } = useAssetsUniqueValuesByProperty({ property: 'labels' });

  if (!isFetched) {
    return null;
  }

  const setLabel = (newValue?: OptionType<string>[]) => {
    const newFilters: OptionValue =
      newValue && newValue.length > 0
        ? newValue.map((val) => ({ label: val.label, value: val.label }))
        : undefined;
    setValue(newFilters);
    trackUsage(DATA_EXPLORATION_COMPONENT.SELECT.LABEL_FILTER, {
      ...newValue,
      resourceType,
    });
  };

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content={t(
        'PERMISSIONS_ERROR_FETCHING',
        'Error fetching labels, please make sure you have labelsAcl:READ',
        {
          dataType: 'labels',
          permissionType: 'labelsAcl:READ',
        }
      )}
    >
      <>
        <FilterFacetTitle>{t('LABELS', 'Labels')}</FilterFacetTitle>
        <MultiSelect
          options={labels.map((label) => ({
            label: String(label.value),
            value: String(label.value),
          }))}
          cogsTheme="grey"
          menuPosition="fixed"
          isDisabled={isError || !allowLabels}
          onChange={setLabel}
          value={value as OptionType<string>[]}
          isMulti
          isSearchable
          isClearable
          addNilOption={addNilOption}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: zIndex.MAXIMUM }),
            menu: (provided) => ({
              ...provided,
              zIndex: `${zIndex.MAXIMUM} !important`,
            }),
          }}
        />
      </>
    </Tooltip>
  );
};
