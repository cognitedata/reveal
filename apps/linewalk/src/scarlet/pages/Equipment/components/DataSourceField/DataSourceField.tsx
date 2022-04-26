import {
  BooleanDetectionValue,
  DataElementType,
  DataElementUnit,
} from 'scarlet/types';
import { getPrettifiedBooleanDataElementValue } from 'scarlet/utils';

import { AutoCompleteField, DateField, RadioGroupField, StringField } from '..';

export interface DataSourceFieldProps {
  name: 'value' | 'externalSource';
  label: string;
  id?: string;
  type?: DataElementType;
  unit?: DataElementUnit;
  disabled?: boolean;
  values?: string[];
}

const booleanOptions = [
  BooleanDetectionValue.YES,
  BooleanDetectionValue.NO,
].reduce(
  (result, item) => ({
    ...result,
    [item]: getPrettifiedBooleanDataElementValue(item),
  }),
  {}
);

export const DataSourceField = ({ type, ...props }: DataSourceFieldProps) => {
  switch (type) {
    case DataElementType.DATE:
      return <DateField {...props} />;

    case DataElementType.ENUM:
      return renderEnumType(props);

    case DataElementType.BOOLEAN:
      return <RadioGroupField {...props} options={booleanOptions} />;

    case DataElementType.STRING:
      return renderStringType(props);

    default:
      return <StringField {...props} />;
  }
};

const renderEnumType = (props: DataSourceFieldProps) => {
  switch (props.values?.length ?? 0) {
    case 2: {
      const options = props.values!.reduce(
        (result, item) => ({ ...result, [item]: item }),
        {} as Record<string, string>
      );
      return <RadioGroupField {...props} options={options} />;
    }
    default:
      return <StringField {...props} />;
  }
};

const renderStringType = (props: DataSourceFieldProps) => {
  if (props.values?.length) {
    return <AutoCompleteField {...props} />;
  }
  return <StringField {...props} />;
};
