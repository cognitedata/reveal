import { Input } from '@cognite/cogs.js';
import { Field, useFormikContext } from 'formik';
import { getPrettifiedDataElementUnit } from 'scarlet/utils';

import { DataSourceFieldProps } from '..';

import * as Styled from './style';

export const StringField = ({
  id,
  label,
  name,
  disabled,
  unit,
}: DataSourceFieldProps) => {
  const { setFieldValue } = useFormikContext();

  return (
    <Styled.Container>
      <Field
        as={Input}
        id={id}
        name={name}
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
