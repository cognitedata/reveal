import { useEffect } from 'react';

import { useFormikContext } from 'formik';

import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { generateOutputTimeSeriesExternalId } from '../../../../utils/externalIdGenerators';
import { SelectBox, StepsContainer } from '../../elements';

import { DynamicFields, StepType, Unit, UnitType, Variable } from './Fields';
import type { StepCommandProps } from './utils';
import { getInputOutputIndex } from './utils';

export function Get({
  dynamicStepFields,
  step,
  routineOrder,
  stepIndex,
}: StepCommandProps) {
  const props = {
    routineIndex: routineOrder,
    step,
    stepIndex,
    dynamicStepFields,
  };

  const { values, setFieldValue } = useFormikContext<UserDefined>();

  const { index: inputOutputIndex, didFindEntry } = getInputOutputIndex(
    values.outputTimeSeries,
    step.arguments.value ?? ''
  );

  useEffect(() => {
    if (didFindEntry) {
      const currentTs = values.outputTimeSeries[inputOutputIndex];
      const generateTimeSeriesExternalId = generateOutputTimeSeriesExternalId({
        simulator: values.simulator,
        calculationType: values.calculationName,
        modelName: values.modelName,
        timeSeriesType: currentTs.type,
      });
      setFieldValue(
        `outputTimeSeries.${inputOutputIndex}.externalId`,
        generateTimeSeriesExternalId
      );
    }
  }, [values.outputTimeSeries]);

  return (
    <div style={{ display: 'flex' }}>
      <StepsContainer>
        <SelectBox>
          <StepType {...props} />
          <Variable {...props} timeSeriesPrefix="outputTimeSeries" />
          {didFindEntry && (
            <>
              <UnitType {...props} timeSeriesPrefix="outputTimeSeries" />
              <Unit {...props} timeSeriesPrefix="outputTimeSeries" />
            </>
          )}
          <SelectBox>
            <DynamicFields {...props} />
          </SelectBox>
        </SelectBox>
      </StepsContainer>
    </div>
  );
}
