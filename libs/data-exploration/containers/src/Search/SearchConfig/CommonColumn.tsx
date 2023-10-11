import { Flex } from '@cognite/cogs.js';

import {
  COMMON_COLUMN_HEADER,
  fuzzySearchToggleColumns,
  searchConfigCommonColumns,
  SearchConfigDataType,
  useTranslation,
} from '@data-exploration-lib/core';

import { checkFuzzySearchEnabled } from '../SearchResults/utils/checkFuzzySearchEnabled';
import { getNumberOfCheckedColumns } from '../SearchResults/utils/getNumberOfCheckedColumns';

import {
  ColumnHeader,
  CommonColumnWrapper,
  CommonWrapper,
  ModalCheckbox,
} from './elements';
import { FuzzySearchToggle } from './FuzzySearchToggle';

type Props = {
  searchConfigData: SearchConfigDataType;
  onChange: (enabled: boolean, index: number) => void;
  onToggleFuzzySearch: (enabled: boolean, index: number) => void;
};

export const CommonColumn = ({
  searchConfigData,
  onChange,
  onToggleFuzzySearch,
}: Props) => {
  const resourcesLength = Object.keys(searchConfigData).length;
  const { t } = useTranslation();

  const isOptionIndeterminate = (checkedColumnsLength: number) => {
    return checkedColumnsLength > 0 && checkedColumnsLength < resourcesLength;
  };

  const isOptionChecked = (checkedColumnsLength: number) => {
    return (
      checkedColumnsLength === resourcesLength ||
      (checkedColumnsLength > 0 && checkedColumnsLength < resourcesLength)
    );
  };

  return (
    <CommonColumnWrapper data-testid="search-config-Common">
      <CommonWrapper direction="column">
        <ColumnHeader>{t('COMMON', COMMON_COLUMN_HEADER)}</ColumnHeader>
        {searchConfigCommonColumns.map((column, index) => {
          const checkedColumnsLength = getNumberOfCheckedColumns(
            searchConfigData,
            index
          );

          const isFuzzySearchEnabled = checkFuzzySearchEnabled(
            searchConfigData,
            index
          );

          const showFuzzySearchToggle =
            fuzzySearchToggleColumns.includes(column);

          return (
            <Flex>
              <ModalCheckbox
                key={`common_${column}`}
                onChange={(_, isChecked) => onChange(!!isChecked, index)}
                indeterminate={isOptionIndeterminate(checkedColumnsLength)}
                checked={isOptionChecked(checkedColumnsLength)}
                data-testid={`common-column-checkbox-${column}`}
                id={`common-column-checkbox-${column}`}
              >
                {t(
                  `${column
                    .split(' / ')
                    .join('_')
                    .split(' ')
                    .join('_')
                    .toUpperCase()}`,
                  column
                )}
              </ModalCheckbox>

              <FuzzySearchToggle
                visible={showFuzzySearchToggle}
                enabled={isFuzzySearchEnabled}
                onChange={(nextState) => onToggleFuzzySearch(nextState, index)}
              />
            </Flex>
          );
        })}
      </CommonWrapper>
    </CommonColumnWrapper>
  );
};
