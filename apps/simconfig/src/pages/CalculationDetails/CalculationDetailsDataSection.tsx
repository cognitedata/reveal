import React from 'react';

import classNames from 'classnames';
import styled from 'styled-components/macro';

import { Label } from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import { generateOutputTimeSeriesExternalId } from 'utils/externalIdGenerators';

interface CalculationDetailsDataSectionProps {
  configuration: CalculationTemplate;
}
function CalculationDetailsDataSection({
  configuration,
}: CalculationDetailsDataSectionProps) {
  const { simulator, modelName } = configuration;
  return (
    <ConfigurationData>
      <ConfigurationDataSection
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
        <div className="properties">
          <div className="entry">
            <div>Start</div>
            <div>{configuration.schedule.start}</div>
          </div>
          <div className="entry">
            <div>Repeat</div>
            <div>{configuration.schedule.repeat}</div>
          </div>
        </div>
      </ConfigurationDataSection>
      <ConfigurationDataSection>
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
      </ConfigurationDataSection>
      <ConfigurationDataSection
        className={classNames({
          enabled: configuration.logicalCheck.enabled,
          disabled: !configuration.logicalCheck.enabled,
        })}
      >
        <h3>
          Logical Check{' '}
          {configuration.logicalCheck.enabled || (
            <Label size="small" variant="danger">
              disabled
            </Label>
          )}
        </h3>
        <div className="properties">
          <div className="entry">
            <div>External ID</div>
            <div>{configuration.logicalCheck.externalId}</div>
          </div>
          <div className="entry">
            <div>Aggregate type</div>
            <div>{configuration.logicalCheck.aggregateType}</div>
          </div>
          <div className="entry">
            <div>Check</div>
            <div>{configuration.logicalCheck.check}</div>
          </div>
          <div className="entry">
            <div>Value</div>
            <div>{configuration.logicalCheck.value}</div>
          </div>
        </div>
      </ConfigurationDataSection>
      <ConfigurationDataSection
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
            <div>External ID</div>
            <div>{configuration.steadyStateDetection.externalId}</div>
          </div>
          <div className="entry">
            <div>Aggregate type</div>
            <div>{configuration.steadyStateDetection.aggregateType}</div>
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
      </ConfigurationDataSection>
      <ConfigurationDataSection
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
        <SeriesTable>
          <div className="heading">Input</div>
          <div className="heading">Sensor External ID</div>
          <div className="heading">Unit</div>
          <div className="heading">Sampling Method</div>
          {configuration.inputTimeSeries.map(
            ({ name, unit, aggregateType, sensorExternalId }) => (
              <>
                <div>{name}</div>

                <div>{sensorExternalId}</div>

                <div>{unit}</div>

                <div>{aggregateType}</div>
              </>
            )
          )}
        </SeriesTable>
      </ConfigurationDataSection>
      <ConfigurationDataSection
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
        <SeriesTable>
          <div className="heading">Name</div>
          <div className="heading">External ID</div>
          <div className="heading">Unit</div>
          <div className="heading">Unit type</div>
          {configuration.inputTimeSeries.map(
            ({ name, unit, unitType, type }) => (
              <>
                <div>{name}</div>
                <div>
                  {generateOutputTimeSeriesExternalId({
                    simulator,
                    modelName,
                    timeSeriesType: type,
                    calculationType: unitType,
                  })}
                </div>
                <div>{unit}</div>
                <div>{unitType}</div>
              </>
            )
          )}
        </SeriesTable>
      </ConfigurationDataSection>
    </ConfigurationData>
  );
}

const ConfigurationDataSection = styled.div`
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
    .entry {
      div:nth-child(1) {
        font-weight: bold;
      }
    }
  }
`;
const SeriesTable = styled.div`
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr 1fr;
  .heading {
    font-weight: bold;
    text-transform: capitalize;
  }
`;

const ConfigurationData = styled.div``;

export default CalculationDetailsDataSection;
