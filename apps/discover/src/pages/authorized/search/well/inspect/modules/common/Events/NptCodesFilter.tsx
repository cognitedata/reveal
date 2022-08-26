import { useNptCodeHelpText } from 'domain/wells/npt/internal/hooks/useNptCodeHelpText';
import { NptCodesSelection } from 'domain/wells/npt/internal/types';

import React, { useCallback, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { IconType } from '@cognite/cogs.js';

import { MultiSelectCategorized } from 'components/Filters/MultiSelectCategorized/MultiSelectCategorized';
import { MultiSelectCategorizedOptionMap } from 'components/Filters/MultiSelectCategorized/types';
import { useDeepEffect } from 'hooks/useDeep';

import { Definition } from '../../nptEvents/components/Definition';
import { NoCodeDefinition } from '../../nptEvents/components/NoCodeDefinition';
import { getEventsFilterSelection } from '../utils';

interface NptCodesFilterProps {
  options: MultiSelectCategorizedOptionMap;
  onChange: (events: NptCodesSelection) => void;
  iconInsteadText?: IconType;
}

export const NptCodesFilter: React.FC<NptCodesFilterProps> = ({
  options,
  onChange,
  iconInsteadText,
}) => {
  const nptCodeHelpText = useNptCodeHelpText();

  const [isInitialized, setInitialized] = useState(false);

  const [selectedOptions, setSelectedOptions] =
    useState<MultiSelectCategorizedOptionMap>({});

  const renderNptHelpText = (nptCode: string) => {
    const codeDefinition = nptCodeHelpText?.[nptCode];

    if (!codeDefinition) {
      return <NoCodeDefinition />;
    }

    return <Definition definition={codeDefinition} />;
  };

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
        getEventsFilterSelection<NptCodesSelection>(selectedOptions);

      setSelectedOptions(selectedOptions);
      onChange(selection);
    },
    [setSelectedOptions, onChange]
  );

  return (
    <MultiSelectCategorized
      title="NPT"
      onValueChange={(selectedOptions) =>
        handleValueChange(selectedOptions as MultiSelectCategorizedOptionMap)
      }
      renderCategoryHelpText={renderNptHelpText}
      options={options}
      selectedOptions={selectedOptions}
      width={iconInsteadText ? undefined : 180}
      viewMode="submenu"
      iconInsteadText={iconInsteadText}
    />
  );
};
