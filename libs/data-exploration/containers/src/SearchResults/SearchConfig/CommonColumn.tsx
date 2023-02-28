import {
  SearchConfigColumnType,
  SearchConfigDataType,
} from '@data-exploration-lib/core';
import {
  ColumnHeader,
  CommonColumnWrapper,
  CommonWrapper,
  ModalCheckbox,
} from './elements';

type Props = {
  data: SearchConfigDataType[];
  commonColumns: SearchConfigColumnType[];
  resourcesLength: number;
  onChange: (isChecked: boolean, column: SearchConfigColumnType) => void;
};

export const CommonColumn = ({
  data,
  commonColumns,
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
        <ColumnHeader>{'Common'}</ColumnHeader>
        {commonColumns.map((column) => {
          const checkedColumnsLength = data.filter(
            (item) =>
              item.columns.find((col) => col.id === column.id)?.isChecked
          ).length;

          return (
            <ModalCheckbox
              key={`common_${column}`}
              onChange={(_, isChecked) => onChange(!!isChecked, column)}
              indeterminate={isOptionIndeterminate(checkedColumnsLength)}
              checked={isOptionChecked(checkedColumnsLength)}
            >
              {column.label}
            </ModalCheckbox>
          );
        })}
      </CommonWrapper>
    </CommonColumnWrapper>
  );
};
