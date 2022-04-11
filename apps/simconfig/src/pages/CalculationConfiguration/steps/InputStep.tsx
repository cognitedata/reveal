import React from 'react';
import { useMatch } from 'react-location';

import { Field, useFormikContext } from 'formik';

import type { OptionType } from '@cognite/cogs.js';
import { Label, Select } from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import {
  FormContainer,
  FormHeader,
  FormRowStacked,
  TimeSeriesField,
} from 'components/forms/elements';

import type { StepProps } from '../types';

import { InputInfoDrawer } from './infoDrawers/InputInfoDrawer';

import type { AppLocationGenerics } from 'routes';

export function InputStep({ isDisabled }: StepProps) {
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

  return (
    <FormContainer>
      <FormHeader>
        Input configuration
        <InputInfoDrawer />
      </FormHeader>
      {values.inputTimeSeries.map(
        ({ type, name, unit, unitType, sampleExternalId }, index) => (
          <React.Fragment key={type}>
            <FormHeader>{name}</FormHeader>
            <FormRowStacked>
              <TimeSeriesField
                aggregateTypeField={`inputTimeSeries.${index}.aggregateType`}
                externalIdField={`inputTimeSeries.${index}.sensorExternalId`}
              />

              <div className="cogs-input-container">
                <div className="title">Unit</div>
                <Field
                  as={Select}
                  isDisabled={isDisabled}
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
