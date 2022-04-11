import React, { useMemo, useState } from 'react';
import { useMatch } from 'react-location';
import type { CellProps } from 'react-table';

import { ParentSizeModern } from '@visx/responsive';

import { Field, useFormikContext } from 'formik';
import styled from 'styled-components/macro';

import type { ButtonProps, OptionType } from '@cognite/cogs.js';
import {
  Button,
  Input,
  Select,
  Switch,
  Table,
  Tooltip,
  toast,
} from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import { ChokeCurveChart } from 'components/charts/ChokeCurveChart';
import {
  FormContainer,
  FormHeader,
  FormRowStacked,
  NumberField,
} from 'components/forms/elements';
import { Alert } from 'components/molecules/Alert';

import type { StepProps } from '../types';

import { BHPEstimationInfoDrawer } from './infoDrawers/BHPEstimationInfoDrawer';
import { ChokeCurveInfoDrawer } from './infoDrawers/ChokeCurveInfoDrawer';
import { GaugeDepthInfoDrawer } from './infoDrawers/GaugeDepthInfoDrawer';
import { GradientTraverseGaugeDepthInfoDrawer } from './infoDrawers/GradientTraverseGaugeDepthInfoDrawer';
import { RootFindingInfoDrawer } from './infoDrawers/RootFindingInfoDrawer';

import type { AppLocationGenerics } from 'routes';

export function AdvancedStep({ isDisabled }: StepProps) {
  const { values, setFieldValue } = useFormikContext<CalculationTemplate>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const chokeCurveColumns = useMemo(
    () => [
      {
        Header: 'Valve opening',
        accessor: (d: ChokeCurveData) => d.opening,
        Cell: inputCell('chokeCurve.opening', setFieldValue, 0, 100, 1),
        width: 200,
      },
      {
        Header: 'Choke setting',
        accessor: (d: ChokeCurveData) => d.setting,
        Cell: inputCell(
          'chokeCurve.setting',
          setFieldValue,
          undefined,
          undefined,
          0.01
        ),
      },
    ],
    [setFieldValue]
  );

  if (!definitions) {
    return null;
  }

  if (
    values.calculationType !== 'IPR' &&
    values.calculationType !== 'VLP' &&
    values.calculationType !== 'ChokeDp' &&
    values.calculationType !== 'BhpFromGradientTraverse'
  ) {
    return null;
  }

  const bhpEstimationMethodOptions: OptionType<string>[] = Object.entries(
    definitions.type.bhpEstimationMethod
  ).map(([value, label]) => ({ value, label }));

  const lengthUnitOptions: OptionType<string>[] = Object.entries(
    definitions.unit.length
  ).map(([value, label]) => ({ value, label }));

  const rootFindingSolutionOptions: OptionType<string>[] = Object.entries(
    definitions.type.rootFindingSolution
  ).map(([value, label]) => ({ value, label }));

  const chokeCurveData =
    values.calculationType === 'ChokeDp'
      ? values.chokeCurve.opening.map((opening, index) => ({
          id: Math.random(),
          opening,
          setting: values.chokeCurve.setting[index],
        }))
      : [];

  const resetChokeCurve = () => {
    setFieldValue(
      'chokeCurve.opening',
      [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    );
    setFieldValue('chokeCurve.setting', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  };

  return (
    <FormContainer>
      {values.calculationType === 'ChokeDp' ? (
        <>
          <FormHeader>
            Choke curve
            <Button onClick={resetChokeCurve}>Reset choke curve</Button>
            <ChokeCurveInfoDrawer />
          </FormHeader>
          <ChokeCurveContainer>
            <ChokeCurveSidebar>
              <div className="cogs-input-container">
                <div className="title">Unit</div>
                <Field
                  as={Select}
                  name="chokeCurve.unit"
                  options={lengthUnitOptions}
                  value={lengthUnitOptions.find(
                    (option) => option.value === values.chokeCurve.unit
                  )}
                  closeMenuOnSelect
                  onChange={({ value }: OptionType<string>) => {
                    setFieldValue('chokeCurve.unit', value);
                  }}
                />
              </div>

              <div className="chart-container">
                <ParentSizeModern>
                  {({ width, height }) => (
                    <ChokeCurveChart
                      data={values.chokeCurve.opening.map((x, index) => ({
                        x,
                        y: values.chokeCurve.setting[index],
                      }))}
                      height={height}
                      width={width}
                      xAxisLabel="Valve opening (%)"
                      yAxisLabel={`Choke setting (${values.chokeCurve.unit})`}
                    />
                  )}
                </ParentSizeModern>
              </div>

              <ClipboardContainer>
                <Alert color="primary" icon="Info">
                  <p>
                    Tabular choke curve data may be copied and pasted from
                    Excel, Google Sheets, etc. below.
                  </p>
                  <ul>
                    <li>
                      Column A must contain valve opening values in the ranges
                      [0, 100] or [0, 1].
                    </li>
                    <li>Column B must contain choke setting values.</li>
                  </ul>
                </Alert>
                <div className="actions">
                  <PasteButton
                    block
                    onPasteSuccess={(text) => {
                      try {
                        const curve = text
                          .split(/[\r?\n]/)
                          .reduce<{ opening: number[]; setting: number[] }>(
                            (entries, entry) => {
                              const [opening, setting] = entry.split(/[\t; ]/);
                              if (
                                typeof opening !== 'string' ||
                                typeof setting !== 'string'
                              ) {
                                return entries;
                              }
                              entries.opening.push(+opening);
                              entries.setting.push(+setting);
                              return entries;
                            },
                            { opening: [], setting: [] }
                          );

                        if (
                          curve.opening.length < 2 ||
                          curve.setting.length < 2 ||
                          curve.opening.length !== curve.setting.length
                        ) {
                          throw new Error('Invalid choke curve array length');
                        }

                        setFieldValue(`chokeCurve.opening`, curve.opening);
                        setFieldValue(`chokeCurve.setting`, curve.setting);

                        toast.info(
                          `Choke curve with ${curve.opening.length} entries pasted from clipboard.`,
                          {
                            autoClose: 3000,
                          }
                        );
                      } catch (e) {
                        const message =
                          e instanceof Error ? e.message : 'Unknown error';
                        toast.error(
                          `Could not parse choke curve from clipboard: ${message}`
                        );
                      }
                    }}
                  />
                  <Button
                    icon="Copy"
                    onClick={async () => {
                      const curveTabSeparated = values.chokeCurve.opening
                        .map((opening, index) =>
                          [opening, values.chokeCurve.setting[index]].join('\t')
                        )
                        .join('\n');

                      await navigator.clipboard.writeText(curveTabSeparated);

                      toast.info('Choke curve copied to clipboard');
                    }}
                  >
                    Copy to clipboard
                  </Button>
                </div>
              </ClipboardContainer>
            </ChokeCurveSidebar>
            <Table<ChokeCurveData>
              columns={chokeCurveColumns}
              dataSource={chokeCurveData}
              flexLayout={{
                minWidth: 50,
                width: 500,
                maxWidth: 500,
              }}
              pagination={false}
            />
          </ChokeCurveContainer>
        </>
      ) : null}

      {values.calculationType === 'IPR' || values.calculationType === 'VLP' ? (
        <>
          <FormHeader>
            BHP estimation
            <BHPEstimationInfoDrawer />
            <Field
              as={Switch}
              checked={values.estimateBHP.enabled}
              defaultChecked={false}
              name="estimateBHP.enabled"
              onChange={(value: boolean) => {
                setFieldValue('estimateBHP.enabled', value);
              }}
            />
          </FormHeader>
          {values.estimateBHP.enabled ? (
            <>
              <FormRowStacked>
                <div className="cogs-input-container">
                  <div className="title">Method</div>
                  <Field
                    as={Select}
                    isDisabled={isDisabled}
                    name="estimateBHP.method"
                    options={bhpEstimationMethodOptions}
                    value={bhpEstimationMethodOptions.find(
                      (option) => option.value === values.estimateBHP.method
                    )}
                    closeMenuOnSelect
                    onChange={({ value }: OptionType<string>) => {
                      setFieldValue('estimateBHP.method', value);
                    }}
                  />
                </div>
              </FormRowStacked>
              {values.estimateBHP.method === 'GradientTraverse' ? (
                <>
                  <FormHeader>
                    Gauge Depth <GradientTraverseGaugeDepthInfoDrawer />{' '}
                  </FormHeader>
                  <FormRowStacked>
                    <NumberField
                      disabled={isDisabled}
                      min={0}
                      name="estimateBHP.gaugeDepth.value"
                      title="Length"
                      width={120}
                    />
                    <div className="cogs-input-container">
                      <div className="title">Unit</div>
                      <Field
                        as={Select}
                        name="estimateBHP.gaugeDepth.unit"
                        options={lengthUnitOptions}
                        value={lengthUnitOptions.find(
                          (option) =>
                            option.value === values.estimateBHP.gaugeDepth?.unit
                        )}
                        closeMenuOnSelect
                        onChange={({ value }: OptionType<string>) => {
                          setFieldValue('estimateBHP.gaugeDepth.unit', value);
                        }}
                      />
                    </div>
                  </FormRowStacked>
                </>
              ) : null}
            </>
          ) : null}

          <FormHeader>
            Root finding <RootFindingInfoDrawer />{' '}
          </FormHeader>
          <FormRowStacked>
            <div className="cogs-input-container">
              <div className="title">Main solution</div>
              <Field
                as={Select}
                name="rootFindingSettings.mainSolution"
                options={rootFindingSolutionOptions}
                value={rootFindingSolutionOptions.find(
                  (option) =>
                    option.value === values.rootFindingSettings.mainSolution
                )}
                closeMenuOnSelect
                onChange={({ value }: OptionType<string>) => {
                  setFieldValue('rootFindingSettings.mainSolution', value);
                }}
              />
            </div>
            <NumberField
              min={0}
              name="rootFindingSettings.rootTolerance"
              title="Tolerance"
              width={120}
            />
            <NumberField
              min={0}
              name="rootFindingSettings.bracket.lowerBound"
              title="Lower bound"
              width={120}
            />
            <NumberField
              name="rootFindingSettings.bracket.upperBound"
              title="Upper bound"
              width={120}
            />
          </FormRowStacked>
        </>
      ) : null}

      {values.calculationType === 'BhpFromGradientTraverse' ? (
        <>
          <FormHeader>
            Gauge Depth <GaugeDepthInfoDrawer />{' '}
          </FormHeader>
          <FormRowStacked>
            <NumberField
              disabled={isDisabled}
              min={0}
              name="gaugeDepth.value"
              title="Length"
              width={120}
            />
            <div className="cogs-input-container">
              <div className="title">Unit</div>
              <Field
                as={Select}
                name="gaugeDepth.unit"
                options={lengthUnitOptions}
                value={lengthUnitOptions.find(
                  (option) => option.value === values.gaugeDepth.unit
                )}
                closeMenuOnSelect
                onChange={({ value }: OptionType<string>) => {
                  setFieldValue('gaugeDepth.unit', value);
                }}
              />
            </div>
          </FormRowStacked>
        </>
      ) : null}
    </FormContainer>
  );
}

const ChokeCurveContainer = styled.div`
  display: flex;
  column-gap: 24px;
  table {
    td {
      padding: 2px;
    }
    input {
      width: 100%;
      appearance: auto !important;
      background: transparent;
      border-color: transparent;
    }
  }
  .chart-container {
    height: 300px;
  }
`;

const ChokeCurveSidebar = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-flow: column nowrap;
  row-gap: 24px;
  max-width: 400px;
`;

interface ChokeCurveData {
  id: number;
  opening: number;
  setting: number;
}

const inputCell =
  (
    field: string,
    setFieldValue: (field: string, value: number | string) => void,
    min?: number,
    max?: number,
    step?: number
  ) =>
  ({
    value,
    row,
  }: React.PropsWithChildren<CellProps<ChokeCurveData, number>>) =>
    (
      <Input
        max={max}
        min={min}
        step={step}
        type="number"
        value={value}
        onChange={(ev) => {
          setFieldValue(`${field}[${row.index}]`, ev.target.value);
        }}
      />
    );

const ClipboardContainer = styled.div`
  .actions {
    display: flex;
    align-items: stretch;
    column-gap: 12px;
    & > * {
      flex: 1 0 auto;
    }
  }
`;

interface PasteButtonProps extends ButtonProps {
  onPasteSuccess: (pastedText: string) => void;
}

function PasteButton({ onPasteSuccess, ...props }: PasteButtonProps) {
  const [text, setText] = useState('');
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  return (
    <div>
      <Tooltip
        content={
          <Input
            placeholder="Paste curve from clipboard"
            rows={1}
            value={text}
            onBlur={() => {
              setIsTooltipVisible(false);
            }}
            onPaste={(ev) => {
              ev.preventDefault();
              onPasteSuccess(ev.clipboardData.getData('text/plain'));
              setText('');
              setIsTooltipVisible(false);
              return false;
            }}
          />
        }
        placement="top-start"
        visible={isTooltipVisible}
        elevated
        interactive
        inverted
      >
        <Button
          icon="InputData"
          onClick={() => {
            setIsTooltipVisible(!isTooltipVisible);
          }}
          {...props}
        >
          Paste from clipboard
        </Button>
      </Tooltip>
    </div>
  );
}
