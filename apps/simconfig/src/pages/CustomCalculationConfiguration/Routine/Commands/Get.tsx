import { useEffect } from 'react';

import { useFormikContext } from 'formik';

import type { UserDefined } from '@cognite/simconfig-api-sdk/rtk';

import { generateOutputTimeSeriesExternalId } from 'utils/externalIdGenerators';

import { SelectBox, StepsContainer } from '../../elements';

import {
  OpenServerAddress,
  StepType,
  Unit,
  UnitType,
  Variable,
} from './Fields';
import type { StepCommandProps } from './utils';
import { getTimeSerieIndexByType } from './utils';

export function Get({ step, routineOrder, stepIndex }: StepCommandProps) {
  const props = { routineIndex: routineOrder, step, stepIndex };

  const { values, setFieldValue } = useFormikContext<UserDefined>();

  const timeSerieIndex = getTimeSerieIndexByType(
    values.outputTimeSeries,
    step.arguments.value ?? ''
  );

  useEffect(() => {
    if (timeSerieIndex !== -1) {
      const currentTs = values.outputTimeSeries[timeSerieIndex];
      const sample = generateOutputTimeSeriesExternalId({
        simulator: values.simulator,
        calculationType: values.calculationName,
        modelName: values.modelName,
        timeSeriesType: currentTs.type,
      });
      setFieldValue(`outputTimeSeries.${timeSerieIndex}.externalId`, sample);
    }
  }, [values.outputTimeSeries]);

  const isVariableDefined = timeSerieIndex !== -1;

  return (
    <div style={{ display: 'flex' }}>
      <StepsContainer>
        <SelectBox>
          <StepType {...props} />
          <Variable {...props} timeSeriesPrefix="outputTimeSeries" />
          <OpenServerAddress {...props} />
          {isVariableDefined && (
            <>
              <UnitType {...props} timeSeriesPrefix="outputTimeSeries" />
              <Unit {...props} timeSeriesPrefix="outputTimeSeries" />
            </>
          )}
        </SelectBox>
      </StepsContainer>
    </div>
  );
}
