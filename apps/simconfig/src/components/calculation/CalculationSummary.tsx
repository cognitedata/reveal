import React from 'react';
import { useMatch } from 'react-location';

import classNames from 'classnames';
import styled from 'styled-components/macro';

import { Label } from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import { CalculationScheduleIndicator } from 'components/models/CalculationList/CalculationScheduleIndicator';

import type { AppLocationGenerics } from 'routes';

interface CalculationSummaryProps {
  configuration: CalculationTemplate;
}

export function CalculationSummary({ configuration }: CalculationSummaryProps) {
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

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
        <h3>Data Sampling</h3>
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
            <div>Timeseries</div>
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
          Steady State Detection{' '}
          {configuration.steadyStateDetection.enabled || (
            <Label size="small" variant="danger">
              disabled
            </Label>
          )}
        </h3>
        <div className="properties">
          <div className="entry">
            <div>Timeseries</div>
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
                value={configuration.steadyStateDetection.aggregateType}
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
                <NullableValue value={configuration.chokeCurve?.unit} />
              </div>
            </div>
          </div>
          <ChokeCurve>
            <div>
              {configuration.chokeCurve?.opening.map((opening) => (
                <span className="opening" key={opening}>
                  {opening}%{' '}
                </span>
              ))}
            </div>
            <div>
              {configuration.chokeCurve?.opening.map((opening, index) => (
                <NullableValue
                  key={opening}
                  rejectFalsyValues={false}
                  value={configuration.chokeCurve?.setting[index]}
                />
              ))}
            </div>
          </ChokeCurve>
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
          <div className="heading">Sensor timeseries</div>
          <div className="heading">Sampling method</div>
          {configuration.inputTimeSeries.map(
            ({ name, unit, aggregateType, sensorExternalId }) => (
              <React.Fragment key={name}>
                <div>
                  <NullableValue value={name} />
                </div>
                <div>
                  <NullableValue value={unit} />
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
          <div className="heading">Timeseries</div>
          {configuration.outputTimeSeries.map(
            ({ name, unit, unitType, externalId }) => (
              <React.Fragment key={name}>
                <div>
                  <NullableValue value={name} />
                </div>
                <div>
                  <NullableValue
                    value={definitions?.map.unitType[unitType][unit ?? '']}
                  />
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
    text-transform: capitalize;
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
    display: grid;
    grid-template-columns: repeat(10, 1fr);
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
    text-transform: capitalize;
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
    text-transform: capitalize;
  }
`;

const CalculationSummaryContainer = styled.div``;
