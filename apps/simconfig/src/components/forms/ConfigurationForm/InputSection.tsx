import { FieldArray, useFormikContext } from 'formik';
import InputTimeSeriesEntry from 'components/forms/controls/InputTimeSeriesEntry';
import { SectionTitle } from 'components/forms/elements';

import { CalculationConfig } from './types';

export function InputSection() {
  const {
    values: { inputTimeSeries },
  } = useFormikContext<CalculationConfig>();
  return (
    <>
      <SectionTitle level={2}>INPUTS</SectionTitle>
      <FieldArray name="inputTimeSeries">
        {() =>
          inputTimeSeries.map((timeSeries, i: number) => (
            <InputTimeSeriesEntry
              timeSeries={timeSeries}
              namePrefix={`inputTimeSeries[${i}]`}
              key={timeSeries.name}
            />
          ))
        }
      </FieldArray>
    </>
  );
}
