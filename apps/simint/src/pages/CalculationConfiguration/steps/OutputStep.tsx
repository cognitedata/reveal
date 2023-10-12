import React, { useMemo } from 'react';
import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import type { OptionType } from '@cognite/cogs.js';
import { Select } from '@cognite/cogs.js';
import type {
  CalculationTemplate,
  TimeSeries,
} from '@cognite/simconfig-api-sdk/rtk';

import {
  FormContainer,
  FormHeader,
  FormRowStacked,
  StyledInput,
} from '../../../components/forms/elements';
import type { AppLocationGenerics } from '../../../routes';
import { getOptionLabel } from '../../CustomCalculationConfiguration/Routine/Commands/utils';
import type { StepProps } from '../types';

import { OutputInfoDrawer } from './infoDrawers/OutputInfoDrawer';

export function OutputStep({ isDisabled }: StepProps) {
  const { values, setFieldValue } = useFormikContext<CalculationTemplate>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const simulatorConfig = definitions?.simulatorsConfig?.find(
    (config) => config.key === values.simulator
  );
  const unitsMap = simulatorConfig?.unitDefinitions.unitsMap ?? {};

  const validTimeSeries = useMemo(() => {
    if (values.calculationType !== 'VLP' && values.calculationType !== 'IPR') {
      return values.outputTimeSeries;
    }

    const isOutputTimeSeriesEnabled: Partial<
      Record<TimeSeries['type'], boolean>
    > = {
      BHP: values.estimateBHP.enabled,
    };

    return values.outputTimeSeries.filter(
      ({ type }) => isOutputTimeSeriesEnabled[type] ?? true
    );
  }, [values]);

  return (
    <FormContainer>
      <FormHeader>
        Output configuration
        <OutputInfoDrawer />
      </FormHeader>
      {validTimeSeries.map(
        ({ type, name, unit, unitType, externalId }, index) => (
          <React.Fragment key={type}>
            <FormHeader>{name}</FormHeader>
            <FormRowStacked>
              <Field
                as={StyledInput}
                name={`outputTimeSeries.${index}.externalId`}
                setValue={(value: string) => {
                  setFieldValue(`outputTimeSeries.${index}.externalId`, value);
                }}
                title="Time series"
                type="text"
                value={externalId}
                width={400}
                disabled
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setFieldValue(
                    `outputTimeSeries.${index}.externalId`,
                    event.currentTarget.value
                  );
                }}
              />

              <div className="cogs-input-container">
                <div className="title">Unit</div>
                <Field
                  as={Select}
                  disabled={isDisabled}
                  name={`outputTimeSeries.${index}.unit`}
                  options={unitsMap[unitType] ? unitsMap[unitType].units : []}
                  value={{
                    label: getOptionLabel(
                      unitsMap[unitType] ? unitsMap[unitType].units : [],
                      unit ?? ''
                    ),
                    value: unit ?? '',
                  }}
                  closeMenuOnSelect
                  onChange={({ value }: OptionType<string>) => {
                    setFieldValue(`outputTimeSeries.${index}.unit`, value);
                  }}
                />
              </div>
            </FormRowStacked>
          </React.Fragment>
        )
      )}
    </FormContainer>
  );
}
