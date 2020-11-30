import React, { ChangeEvent, useState } from 'react';
import { Row, Column } from 'react-table';
import {
  DetailsCol,
  DetailsInputType,
  IntegrationFieldValue,
} from '../table/details/DetailsCols';
import { ContactsTableCol } from '../table/details/ContactTableCols';
import InputWithWarning from './InputWithWarning';
import TextAreaWithWarning from './TextAreaWithWarning';

type ColumnType = DetailsCol | ContactsTableCol;

interface EditableCellProps<T extends ColumnType> {
  value: string | number;
  row: Row<T>;
  column: Column<T>;
  updateData: (
    rowIndex: number,
    columnId: string,
    value: IntegrationFieldValue
  ) => void;
  // eslint-disable-next-line react/require-default-props
  inputType?: DetailsInputType;
  // eslint-disable-next-line react/require-default-props
  testId?: string;
}
const EditableCell = <T extends ColumnType>({
  value: initialValue,
  row,
  column: { id },
  updateData,
  testId = '',
  inputType = 'text',
}: EditableCellProps<T>) => {
  const { index } = row;
  const [value, setValue] = useState(initialValue);
  const [isChanged, setIsChanged] = useState(false);

  const dateTestId: Readonly<string> = `${row.original.accessor}-${testId}-${index}`;

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  const onBlur = () => {
    updateData(index, `${id}`, value);
    setIsChanged(true);
  };

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);
  switch (inputType) {
    case 'text':
      return (
        <InputWithWarning
          value={value}
          onBlur={onBlur}
          onChange={onChange}
          isChanged={isChanged}
          dataTestId={dateTestId}
        />
      );
    case 'textarea':
      return (
        <TextAreaWithWarning
          onBlur={onBlur}
          onChange={onChange}
          isChanged={isChanged}
          value={value}
          dataTestId={dateTestId}
        />
      );
    default:
      return (
        <InputWithWarning
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          isChanged={isChanged}
          dataTestId={dateTestId}
        />
      );
  }
};
export default EditableCell;
