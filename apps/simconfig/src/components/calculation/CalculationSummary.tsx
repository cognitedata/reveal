import React from 'react';
import { useMatch } from 'react-location';

import classNames from 'classnames';
import styled from 'styled-components/macro';

import { Label } from '@cognite/cogs.js';
import type {
  CalculationTemplate,
  DefinitionMap,
} from '@cognite/simconfig-api-sdk/rtk';

import { CalculationScheduleIndicator } from 'components/models/CalculationList/CalculationScheduleIndicator';
import { getScheduleRepeat } from 'pages/CalculationConfiguration/utils';

import type { AppLocationGenerics } from 'routes';

interface CalculationSummaryProps {
  configuration: CalculationTemplate;
}

export function CalculationSummary({ configuration }: CalculationSummaryProps) {
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const displayUnit = (
    unit: string,
    unitType: keyof DefinitionMap['map']['unitType']
  ): string => {
    // Check if unitType is already defined on DefinitionMap['map']['unitType']
    // New simualtors (apart from PROSPER & ProcessSim) might not have unitType defined under DefinitionMap['map']['unitType']
    if (
      definitions?.map.unitType &&
      unitType in definitions.map.unitType &&
      unit in definitions.map.unitType
    ) {
      return definitions.map.unitType[unitType][unit];
    }
    return unit;
  };

  return (
    <CalculationSummaryContainer>
      <ConfigurationSection
        className={classNames({
          enabled: configuration.schedule.enabled,
          disabled: !configuration.schedule.enabled,
        })}
      >
        <h3>
          Schedule{' '}
          {configuration.schedule.enabled || (
            <Label size="small" variant="danger">
              disabled
            </Label>
          )}
        </h3>
        <CalculationScheduleIndicator
          className="schedule"
          schedule={configuration.schedule}
        />
      </ConfigurationSection>
      <ConfigurationSection>
        <h3>Data sampling</h3>
        <div className="properties">
          <div className="entry">
            <div>Validation window</div>
            <div>{configuration.dataSampling.validationWindow} min</div>
          </div>
          <div className="entry">
            <div>Sampling window</div>
            <div>{configuration.dataSampling.samplingWindow} min</div>
          </div>
          <div className="entry">
            <div>Granularity</div>
            <div>{configuration.dataSampling.granularity} min</div>
          </div>
          <div className="entry">
            <div>Validation offset</div>
            <div>
              {
                getScheduleRepeat(
                  configuration.dataSampling.validationEndOffset ?? '0m'
                ).minutes
              }{' '}
              min
            </div>
          </div>
        </div>
      </ConfigurationSection>
      <ConfigurationSection
        className={classNames({
          enabled: configuration.logicalCheck.enabled,
          disabled: !configuration.logicalCheck.enabled,
        })}
      >
        <h3>
          Logical check{' '}
          {configuration.logicalCheck.enabled || (
            <Label size="small" variant="danger">
              disabled
            </Label>
          )}
        </h3>
        <div className="properties">
          <div className="entry">
            <div>Time series</div>
            <div>
              <NullableValue value={configuration.logicalCheck.externalId} />
            </div>
          </div>
          <div className="entry">
            <div>Sampling method</div>
            <div>
              <NullableValue
                value={
                  configuration.logicalCheck.aggregateType
                    ? definitions?.type.aggregate[
                        configuration.logicalCheck.aggregateType
                      ]
                    : null
                }
              />
            </div>
          </div>
          <div className="entry">
            <div>Check</div>
            <div>
              <NullableValue
                value={
                  configuration.logicalCheck.check
                    ? definitions?.type.check[configuration.logicalCheck.check]
                    : null
                }
              />
            </div>
          </div>
          <div className="entry">
            <div>Value</div>
            <div>{configuration.logicalCheck.value}</div>
          </div>
        </div>
      </ConfigurationSection>
      <ConfigurationSection
        className={classNames({
          enabled: configuration.steadyStateDetection.enabled,
          disabled: !configuration.steadyStateDetection.enabled,
        })}
      >
        <h3>
          Steady state detection{' '}
          {configuration.steadyStateDetection.enabled || (
            <Label size="small" variant="danger">
              disabled
            </Label>
          )}
        </h3>
        <div className="properties">
          <div className="entry">
            <div>Time series</div>
            <div>
              <NullableValue
                value={configuration.steadyStateDetection.externalId}
              />
            </div>
          </div>
          <div className="entry">
            <div>Sampling method</div>
            <div>
              <NullableValue
                value={
                  configuration.steadyStateDetection.aggregateType
                    ? definitions?.type.aggregate[
                        configuration.steadyStateDetection.aggregateType
                      ]
                    : null
                }
              />
            </div>
          </div>
          <div className="entry">
            <div>Min. section size</div>
            <div>{configuration.steadyStateDetection.minSectionSize}</div>
          </div>
          <div className="entry">
            <div>Var threshold</div>
            <div>{configuration.steadyStateDetection.varThreshold}</div>
          </div>
          <div className="entry">
            <div>Slope threshold</div>
            <div>{configuration.steadyStateDetection.slopeThreshold}</div>
          </div>
        </div>
      </ConfigurationSection>

      {'chokeCurve' in configuration ? (
        <ConfigurationSection>
          <h3>Choke curve</h3>
          <div className="properties">
            <div className="entry">
              <div>Unit</div>
              <div>
                <NullableValue value={configuration.chokeCurve.unit} />
              </div>
            </div>
          </div>
          <ChokeCurve>
            <div>
              {configuration.chokeCurve.opening.map((opening) => (
                <span className="opening" key={opening}>
                  {opening}%{' '}
                </span>
              ))}
            </div>
            <div>
              {configuration.chokeCurve.opening.map((opening, index) => (
                <NullableValue
                  key={opening}
                  rejectFalsyValues={false}
                  value={configuration.chokeCurve.setting[index]}
                />
              ))}
            </div>
          </ChokeCurve>
        </ConfigurationSection>
      ) : null}

      {'estimateBHP' in configuration ? (
        <ConfigurationSection
          className={classNames({
            enabled: configuration.estimateBHP.enabled,
            disabled: !configuration.estimateBHP.enabled,
          })}
        >
          <h3>
            BHP estimation{' '}
            {configuration.estimateBHP.enabled || (
              <Label size="small" variant="danger">
                disabled
              </Label>
            )}
          </h3>
          <div className="properties">
            <div className="entry">
              <div>Method</div>
              <div>
                <NullableValue value={configuration.estimateBHP.method} />
              </div>
            </div>
            <div className="entry">
              <div>Gauge depth</div>
              <div>
                <NullableValue
                  value={configuration.estimateBHP.gaugeDepth?.value}
                />{' '}
                <NullableValue
                  value={configuration.estimateBHP.gaugeDepth?.unit}
                />
              </div>
            </div>
          </div>
        </ConfigurationSection>
      ) : null}

      {'gaugeDepth' in configuration ? (
        <ConfigurationSection
          className={classNames({
            enabled: configuration.gaugeDepth,
            disabled: !configuration.gaugeDepth,
          })}
        >
          <h3>Gauge depth </h3>
          <div className="properties">
            <div className="entry">
              <div>{/* no label  */}</div>
              <div>
                <NullableValue value={configuration.gaugeDepth.value} />{' '}
                <NullableValue value={configuration.gaugeDepth.unit} />
              </div>
            </div>
          </div>
        </ConfigurationSection>
      ) : null}

      {'rootFindingSettings' in configuration ? (
        <ConfigurationSection>
          <h3>Root finding</h3>
          <div className="properties">
            <div className="entry">
              <div>Main solution</div>
              <div>
                <NullableValue
                  value={configuration.rootFindingSettings.mainSolution}
                />
              </div>
            </div>
            <div className="entry">
              <div>Tolerance</div>
              <div>
                <NullableValue
                  value={configuration.rootFindingSettings.rootTolerance}
                />
              </div>
            </div>
            <div className="entry">
              <div>Lower bound</div>
              <div>
                <NullableValue
                  value={configuration.rootFindingSettings.bracket.lowerBound}
                />
              </div>
            </div>
            <div className="entry">
              <div>Upper bound</div>
              <div>
                <NullableValue
                  value={configuration.rootFindingSettings.bracket.upperBound}
                />
              </div>
            </div>
          </div>
        </ConfigurationSection>
      ) : null}

      {'routine' in configuration ? (
        <ConfigurationSection>
          <h3>Calculation routine</h3>
          <CalculationRoutineList>
            {configuration.routine
              ? configuration.routine.map(({ order, description, steps }) => (
                  <React.Fragment key={order}>
                    <div className="heading">
                      {order}. {description}
                    </div>
                    {steps.map(({ step, type, arguments: args }) => (
                      <React.Fragment key={step}>
                        <div className="step">
                          {order}.{step}. {type} (
                          {args.value
                            ? `${args.address}, ${args.value}`
                            : args.address}
                          )
                        </div>
                      </React.Fragment>
                    ))}
                  </React.Fragment>
                ))
              : null}
          </CalculationRoutineList>
        </ConfigurationSection>
      ) : null}

      <ConfigurationSection
        className={classNames({
          enabled: !!configuration.inputTimeSeries.length,
          disabled: !configuration.inputTimeSeries.length,
        })}
      >
        <h3>
          Inputs{' '}
          {!!configuration.inputTimeSeries.length || (
            <Label size="small" variant="danger">
              disabled
            </Label>
          )}
        </h3>
        <InputTimeseriesList>
          <div className="heading">Input</div>
          <div className="heading">Unit</div>
          <div className="heading">Sensor time series</div>
          <div className="heading">Sampling method</div>
          {configuration.inputTimeSeries.map(
            ({
              name,
              unit,
              aggregateType,
              sensorExternalId,
              unitType,
              type,
            }) => (
              <React.Fragment key={name}>
                <div>
                  <NullableValue value={name} /> (<NullableValue value={type} />
                  )
                </div>
                <div>
                  <NullableValue value={displayUnit(unit ?? '', unitType)} /> (
                  <NullableValue value={unitType} />)
                </div>
                <div>
                  <NullableValue value={sensorExternalId} />
                </div>
                <div>
                  <NullableValue
                    value={definitions?.type.aggregate[aggregateType]}
                  />
                </div>
              </React.Fragment>
            )
          )}
        </InputTimeseriesList>
      </ConfigurationSection>
      <ConfigurationSection
        className={classNames({
          enabled: !!configuration.outputTimeSeries.length,
          disabled: !configuration.outputTimeSeries.length,
        })}
      >
        <h3>
          Outputs{' '}
          {!!configuration.outputTimeSeries.length || (
            <Label size="small" variant="danger">
              disabled
            </Label>
          )}
        </h3>
        <OutputTimeseriesList>
          <div className="heading">Name</div>
          <div className="heading">Unit</div>
          <div className="heading">Time series</div>
          {configuration.outputTimeSeries.map(
            ({ name, unit, unitType, externalId, type }) => (
              <React.Fragment key={name}>
                <div>
                  <NullableValue value={name} /> (<NullableValue value={type} />
                  )
                </div>
                <div>
                  <NullableValue value={displayUnit(unit ?? '', unitType)} /> (
                  <NullableValue value={unitType} />)
                </div>
                <div>{externalId}</div>
              </React.Fragment>
            )
          )}
        </OutputTimeseriesList>
      </ConfigurationSection>
    </CalculationSummaryContainer>
  );
}

interface NullableValueProps {
  value?: number | string | null;
  rejectFalsyValues?: boolean;
}

function NullableValue({
  value,
  rejectFalsyValues = true,
}: NullableValueProps) {
  if (value === undefined || value === null || (rejectFalsyValues && !value)) {
    return <span className="value null">(not set)</span>;
  }
  return <span className="value">{value}</span>;
}

const ConfigurationSection = styled.div`
  &:not(:first-child) {
    border-top: 1px solid var(--cogs-border-default);
    margin-top: 24px;
  }
  h3 {
    margin-top: 24px;
    text-transform: none;
  }
  &.disabled .properties {
    opacity: 0.5;
  }
  .properties {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .entry {
      div:nth-child(1) {
        font-weight: bold;
      }
    }
  }
  .value {
    &.null {
      opacity: 0.5;
      font-style: italic;
    }
  }
  .schedule {
    font-size: inherit;
  }
`;

const ChokeCurve = styled.div`
  div {
    display: flex;
    .opening,
    .value {
      flex: 1 0 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .opening {
    font-weight: bold;
  }
`;

const InputTimeseriesList = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.5fr 1fr 0.5fr;
  & > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .heading {
    font-weight: bold;
    text-transform: none;
  }
`;

const OutputTimeseriesList = styled.div`
  display: grid;
  grid-template-columns: 1fr 0.5fr 1fr;
  & > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .heading {
    font-weight: bold;
    text-transform: none;
  }
`;

const CalculationRoutineList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  & > div {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .heading {
    margin-top: 8px;
    font-weight: bold;
    text-transform: none;
  }
  .step {
    margin-left: 12px;
    font-weight: italic;
  }
`;

const CalculationSummaryContainer = styled.div``;
