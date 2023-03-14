import {
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
  resourcesLength: number;
  onChange: (enabled: boolean, index: number) => void;
};

export const CommonColumn = ({
  searchConfigData,
  resourcesLength,
  onChange,
}: Props) => {
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
        <ColumnHeader>Common</ColumnHeader>
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
            >
              {column}
            </ModalCheckbox>
          );
        })}
      </CommonWrapper>
    </CommonColumnWrapper>
  );
};
