import {
  COMMON_COLUMN_HEADER,
  searchConfigCommonColumns,
  SearchConfigDataType,
} from '@data-exploration-lib/core';
import { getNumberOfCheckedColumns } from '../utils/getNumberOfCheckedColumns';
import {
  ColumnHeader,
  CommonColumnWrapper,
  CommonWrapper,
  ModalCheckbox,
} from './elements';

type Props = {
  searchConfigData: SearchConfigDataType;
  onChange: (enabled: boolean, index: number) => void;
};

export const CommonColumn = ({ searchConfigData, onChange }: Props) => {
  const resourcesLength = Object.keys(searchConfigData).length;

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
    <CommonColumnWrapper>
      <CommonWrapper direction="column">
        <ColumnHeader>{COMMON_COLUMN_HEADER}</ColumnHeader>
        {searchConfigCommonColumns.map((column, index) => {
          const checkedColumnsLength = getNumberOfCheckedColumns(
            searchConfigData,
            index
          );
          return (
            <ModalCheckbox
              key={`common_${column}`}
              onChange={(_, isChecked) => onChange(!!isChecked, index)}
              indeterminate={isOptionIndeterminate(checkedColumnsLength)}
              checked={isOptionChecked(checkedColumnsLength)}
              data-testid={`common-column-checkbox-${column}`}
            >
              {column}
            </ModalCheckbox>
          );
        })}
      </CommonWrapper>
    </CommonColumnWrapper>
  );
};
