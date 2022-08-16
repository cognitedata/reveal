import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';

import React, { useState } from 'react';

import { IconType } from '@cognite/cogs.js';

import { MultiSelectCategorized } from 'components/Filters/MultiSelectCategorized/MultiSelectCategorized';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { useDeepEffect } from 'hooks/useDeep';

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
  const [selectedOptions, setSelectedOptions] =
    useState<MultiSelectCategorizedOptionMap>({});

  // Automatically select all the options when the component is mounted
  useDeepEffect(() => {
    setSelectedOptions(options);
  }, [options]);

  useDeepEffect(() => {
    onChange(selectedOptions as NdsRiskTypesSelection);
  }, [selectedOptions]);

  return (
    <MultiSelectCategorized
      title="NDS"
      onValueChange={(selectedOptions) =>
        setSelectedOptions(selectedOptions as MultiSelectCategorizedOptionMap)
      }
      options={options}
      selectedOptions={selectedOptions}
      width={iconInsteadText ? undefined : 200}
      viewMode="submenu"
      iconInsteadText={iconInsteadText}
    />
  );
};
