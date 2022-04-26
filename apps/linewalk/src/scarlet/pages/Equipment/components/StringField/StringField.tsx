import { Input } from '@cognite/cogs.js';
import { Field, useFormikContext } from 'formik';
import { getPrettifiedDataElementUnit } from 'scarlet/utils';

import { DataSourceFieldProps, DataSourceFormValues } from '..';

import * as Styled from './style';

export const StringField = ({
  id,
  label,
  name,
  disabled,
  unit,
  printedValue,
}: DataSourceFieldProps & { printedValue?: string }) => {
  const { setFieldValue, values } = useFormikContext<DataSourceFormValues>();

  return (
    <Styled.Container>
      <Field
        as={Input}
        id={id}
        name={name}
        value={printedValue ?? values[name]}
        disabled={disabled}
        title={label}
        variant="titleAsPlaceholder"
        fullWidth
        style={{ height: '48px', borderWidth: '1px' }}
        postfix={getPrettifiedDataElementUnit(unit)}
        validate={(value: string) => (!value?.trim() ? 'Empty' : undefined)}
        onChange={(e: Event) =>
          setFieldValue(name, (e.target as HTMLInputElement).value)
        }
      />
    </Styled.Container>
  );
};
