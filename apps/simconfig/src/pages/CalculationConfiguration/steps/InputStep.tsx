import React, { useMemo } from 'react';
import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import type { OptionType } from '@cognite/cogs.js';
import { Label, Select } from '@cognite/cogs.js';
import type {
  CalculationTemplate,
  CalculationType,
  TimeSeries,
} from '@cognite/simconfig-api-sdk/rtk';

import {
  FormContainer,
  FormHeader,
  FormRowStacked,
  TimeSeriesField,
} from 'components/forms/elements';

import type { StepProps } from '../types';

import type { AppLocationGenerics } from 'routes';

export function InputStep({ isEditing }: StepProps) {
  const { values, setFieldValue } = useFormikContext<CalculationTemplate>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const unitTypeOptions = Object.entries(
    definitions?.map.unitType ?? []
  ).reduce<Record<string, OptionType<string>[]>>(
    (options, [unitType, units]) => ({
      ...options,
      [unitType]: Object.entries(units as Record<string, string>).map(
        ([value, label]) => ({
          value,
          label,
        })
      ),
    }),
    {}
  );

  const validTimeSeries = useMemo(() => {
    if (values.calculationType !== 'VLP' && values.calculationType !== 'IPR') {
      return values.inputTimeSeries;
    }

    const isEstimateBHPEnabled = values.estimateBHP.enabled;
    const isGradientTraverse = values.estimateBHP.method === 'GradientTraverse';
    const isLiftCurveGaugeBhp =
      values.estimateBHP.method === 'LiftCurveGaugeBhp';
    const isLiftCurveRate = values.estimateBHP.method === 'LiftCurveRate';

    const isInputTimeSeriesEnabled: Partial<
      Record<CalculationType, Partial<Record<TimeSeries['type'], boolean>>>
    > = {
      VLP: {
        BHP: !isEstimateBHPEnabled,
        BHPg:
          isEstimateBHPEnabled && (isGradientTraverse || isLiftCurveGaugeBhp),
        GasRate: isEstimateBHPEnabled && isLiftCurveRate,
      },
      IPR: {
        BHP: !isEstimateBHPEnabled,
        BHPg:
          isEstimateBHPEnabled && (isGradientTraverse || isLiftCurveGaugeBhp),
        GasRate: isEstimateBHPEnabled && isLiftCurveRate,
        THP: isEstimateBHPEnabled && (isLiftCurveGaugeBhp || isLiftCurveRate),
        THT: isEstimateBHPEnabled && (isLiftCurveGaugeBhp || isLiftCurveRate),
      },
    };

    return values.inputTimeSeries.filter(
      ({ type }) =>
        isInputTimeSeriesEnabled[values.calculationType]?.[type] ?? true
    );
  }, [values]);

  return (
    <FormContainer>
      {validTimeSeries.map(
        ({ type, name, unit, unitType, sampleExternalId }, index) => (
          <React.Fragment key={type}>
            <FormHeader>{name}</FormHeader>
            <FormRowStacked>
              <TimeSeriesField
                aggregateTypeDisabled={isEditing}
                aggregateTypeField={`inputTimeSeries.${index}.aggregateType`}
                externalIdDisabled={isEditing}
                externalIdField={`inputTimeSeries.${index}.sensorExternalId`}
              />

              <div className="cogs-input-container">
                <div className="title">Unit</div>
                <Field
                  as={Select}
                  disabled={isEditing}
                  name={`inputTimeSeries.${index}.unit`}
                  options={unitTypeOptions[unitType]}
                  value={unitTypeOptions[unitType].find(
                    (option) => option.value === unit
                  )}
                  closeMenuOnSelect
                  onChange={({ value }: OptionType<string>) => {
                    setFieldValue(`inputTimeSeries.${index}.unit`, value);
                  }}
                />
              </div>
            </FormRowStacked>
            <div>
              <Label icon="Timeseries">
                <span>
                  Sampled input values will be saved to{' '}
                  <code>{sampleExternalId}</code>
                </span>
              </Label>
            </div>
          </React.Fragment>
        )
      )}
    </FormContainer>
  );
}
