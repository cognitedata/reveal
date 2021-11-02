import { FieldArray, useFormikContext } from 'formik';
import OutputTimeSeriesEntry from 'components/forms/controls/OutputTimeSeriesEntry';
import { SectionTitle } from 'components/forms/elements';
import { generateOutputTimeSeriesExternalId } from 'utils/externalIdGenerators';

import { CalculationConfig } from './types';

export function OutputSection() {
  const {
    values: { modelName, simulator, calculationType, outputTimeSeries },
  } = useFormikContext<CalculationConfig>();

  return (
    <>
      <SectionTitle level={2}>OUTPUTS</SectionTitle>
      <FieldArray name="outputTimeSeries">
        {() =>
          outputTimeSeries.map((timeSeries, i: number) => {
            const externalId = generateOutputTimeSeriesExternalId({
              simulator,
              calculationType,
              timeSeriesType: timeSeries.type,
              modelName,
            });
            const timeSeriesWithExternalId = {
              ...timeSeries,
              externalId,
            };

            return (
              <OutputTimeSeriesEntry
                timeSeries={timeSeriesWithExternalId}
                namePrefix={`outputTimeSeries[${i}]`}
                key={timeSeries.name}
              />
            );
          })
        }
      </FieldArray>
    </>
  );
}
