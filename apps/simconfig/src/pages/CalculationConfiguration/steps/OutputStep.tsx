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
} from 'components/forms/elements';

import type { AppLocationGenerics } from 'routes';

export function OutputStep() {
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
                title="Timeseries"
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
                  name={`outputTimeSeries.${index}.unit`}
                  options={unitTypeOptions[unitType]}
                  value={unitTypeOptions[unitType].find(
                    (option) => option.value === unit
                  )}
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
