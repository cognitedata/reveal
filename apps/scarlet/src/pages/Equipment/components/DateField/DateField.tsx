import { useEffect, useCallback, useState, useMemo } from 'react';
import { Field, useFormikContext } from 'formik';
import { addLeadingZeros, getDate, getIsValidDate } from 'utils';

import { DataSourceFieldProps, DataSourceFormValues } from '..';

import * as Styled from './style';

export const DateField = ({
  id,
  name,
  label,
  disabled,
}: DataSourceFieldProps) => {
  const { setFieldValue, initialValues } =
    useFormikContext<DataSourceFormValues>();

  const [initialDay, initialMonth, initialYear] = useMemo(() => {
    const initialValue = initialValues[name as 'value'] as string;
    const date = new Date(initialValue);

    if (Number.isNaN(date.getTime())) {
      return ['', '', ''];
    }

    return [
      addLeadingZeros(date.getDate(), 2),
      addLeadingZeros(date.getMonth() + 1, 2),
      addLeadingZeros(date.getFullYear(), 4),
    ];
  }, [initialValues]);

  const [day, setDay] = useState<string>(initialDay);
  const [month, setMonth] = useState<string>(initialMonth);
  const [year, setYear] = useState<string>(initialYear);

  useEffect(() => {
    setFieldValue(
      name,
      getDate(parseInt(year, 10), parseInt(month, 10), parseInt(day, 10))
    );
  }, [day, month, year]);

  const validate = useCallback(
    (value: string) => !getIsValidDate(value) && 'Invalid date',
    []
  );

  return (
    <Field name={name} validate={validate}>
      {() => (
        <>
          <Styled.Label className="cogs-detail">{label}</Styled.Label>
          <Styled.DateContainer disabled={disabled}>
            <Styled.InputContainer>
              <input
                id={id}
                type="number"
                placeholder="MM"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                disabled={disabled}
              />
            </Styled.InputContainer>
            <Styled.InputContainer>
              <input
                type="number"
                placeholder="DD"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                disabled={disabled}
              />
            </Styled.InputContainer>
            <Styled.InputContainer>
              <input
                type="number"
                placeholder="YYYY"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                disabled={disabled}
              />
            </Styled.InputContainer>
          </Styled.DateContainer>
        </>
      )}
    </Field>
  );
};
