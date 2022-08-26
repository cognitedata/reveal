import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';

import React, { useCallback, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { IconType } from '@cognite/cogs.js';

import { MultiSelectCategorized } from 'components/Filters/MultiSelectCategorized/MultiSelectCategorized';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { useDeepEffect } from 'hooks/useDeep';

import { getEventsFilterSelection } from '../utils';

interface NdsRiskTypesFilterProps {
  options: MultiSelectCategorizedOptionMap;
  onChange: (events: NdsRiskTypesSelection) => void;
  iconInsteadText?: IconType;
}

export const NdsRiskTypesFilter: React.FC<NdsRiskTypesFilterProps> = ({
  options,
  onChange,
  iconInsteadText,
}) => {
  const [isInitialized, setInitialized] = useState(false);

  const [selectedOptions, setSelectedOptions] =
    useState<MultiSelectCategorizedOptionMap>({});

  // Automatically select all the options when the component is mounted
  useDeepEffect(() => {
    if (!isEmpty(options) && !isInitialized) {
      setSelectedOptions(options);
      setInitialized(true);
    }
  }, [options]);

  const handleValueChange = useCallback(
    (selectedOptions: MultiSelectCategorizedOptionMap) => {
      const selection =
        getEventsFilterSelection<NdsRiskTypesSelection>(selectedOptions);

      setSelectedOptions(selectedOptions);
      onChange(selection);
    },
    [setSelectedOptions, onChange]
  );

  return (
    <MultiSelectCategorized
      title="NDS"
      onValueChange={(selectedOptions) =>
        handleValueChange(selectedOptions as MultiSelectCategorizedOptionMap)
      }
      options={options}
      selectedOptions={selectedOptions}
      width={iconInsteadText ? undefined : 200}
      viewMode="submenu"
      iconInsteadText={iconInsteadText}
    />
  );
};
