import React, { useEffect, useContext } from 'react';
import moment from 'moment';
import { Button, Title, Tag } from '@cognite/cogs.js';
import { EventSerializable } from 'store/event/types';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { fetchSamplingConfiguration } from 'store/samplingConfiguration/thunks';
import { resetSelectedEvent } from 'store/event';
import { useAppDispatch, useAppSelector } from 'store/hooks';
import { Timestamp } from '@cognite/sdk';
import { selectSamplingConfiguration } from 'store/samplingConfiguration/selectors';
import { GenericInformationTable } from 'components/app/elements';

import { ChartsIOButtons } from './ChartsIOButtons';
import { RunDetailsBox } from './elements';

export interface RunDetailsProps {
  currentEvent: EventSerializable | undefined;
}

const dateToFormat = (epochDate: Timestamp | undefined) =>
  epochDate ? moment(epochDate).format('YYYY-MM-DD HH:mm:ss') : 'N/A';

const subtractDateDifference = (
  start: number | undefined | Timestamp,
  end: number | undefined | Timestamp
) => {
  if (!start || !end) {
    return 'N/A';
  }
  const startDate = moment(start);
  const endDate = moment(end);
  const difference = moment.duration(startDate.diff(endDate));
  const days = difference.days();
  const hours = difference.hours();
  const minutes = difference.minutes();
  const seconds = difference.seconds();
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export const RunDetailsContainer: React.FC<RunDetailsProps> = ({
  currentEvent,
}) => {
  const dispatch = useAppDispatch();
  const { cdfClient } = useContext(CdfClientContext);
  const samplingConfiguration = useAppSelector(selectSamplingConfiguration);

  const closePanel = () => dispatch(resetSelectedEvent());

  useEffect(() => {
    if (currentEvent?.externalId) {
      dispatch(
        fetchSamplingConfiguration({
          client: cdfClient,
          simCalcId: currentEvent.externalId,
        })
      );
    }
  }, [currentEvent]);

  return (
    <RunDetailsBox>
      <div className="header">
        <div className="model-title">
          <Title level={4}>{currentEvent?.metadata?.modelName}</Title>
          <Tag className="version">
            version {currentEvent?.metadata?.modelVersion}
          </Tag>
        </div>
        <Button
          icon="Close"
          type="ghost"
          aria-label="close"
          onClick={closePanel}
        />
      </div>

      <GenericInformationTable>
        <caption>{currentEvent?.metadata?.calcName}</caption>
        <tbody>
          <tr>
            <td>Simulation Created</td>
            <td>{dateToFormat(currentEvent?.createdTime)}</td>
          </tr>

          <tr>
            <td>Simulation Started:</td>
            <td>{dateToFormat(currentEvent?.startTime)}</td>
          </tr>
          <tr>
            <td>Simulation End:</td>
            <td>{dateToFormat(currentEvent?.endTime)}</td>
          </tr>
          <tr>
            <td>Duration:</td>
            <td>
              {subtractDateDifference(
                currentEvent?.endTime,
                currentEvent?.startTime
              )}
            </td>
          </tr>

          <tr>
            <td>Total Duration:</td>
            <td>
              {subtractDateDifference(
                currentEvent?.lastUpdatedTime,
                currentEvent?.createdTime
              )}
            </td>
          </tr>
        </tbody>
      </GenericInformationTable>

      <dl>
        <dt>User</dt>
        <dd>{currentEvent?.metadata?.userEmail}</dd>
      </dl>

      {samplingConfiguration && (
        <>
          <Title className="ssd-title" level={4}>
            Steady State Detection
          </Title>
          <div className="ssd-details">
            <GenericInformationTable>
              <caption>Sampling</caption>
              <tbody>
                <tr>
                  <td>Start</td>
                  <td>{dateToFormat(samplingConfiguration.samplingStart)}</td>
                </tr>

                <tr>
                  <td>End</td>
                  <td>{dateToFormat(samplingConfiguration.samplingEnd)}</td>
                </tr>

                <tr>
                  <td>Window</td>
                  <td>
                    {subtractDateDifference(
                      samplingConfiguration.samplingEnd,
                      samplingConfiguration.samplingStart
                    )}
                  </td>
                </tr>
              </tbody>
            </GenericInformationTable>
            <GenericInformationTable>
              <caption>Validation</caption>
              <tbody>
                <tr>
                  <td>Start</td>
                  <td>{dateToFormat(samplingConfiguration.validationStart)}</td>
                </tr>

                <tr>
                  <td>End</td>
                  <td>{dateToFormat(samplingConfiguration.validationEnd)}</td>
                </tr>
                <tr>
                  <td>Window</td>
                  <td>
                    {subtractDateDifference(
                      samplingConfiguration.validationEnd,
                      samplingConfiguration.validationStart
                    )}
                  </td>
                </tr>
              </tbody>
            </GenericInformationTable>
          </div>
        </>
      )}

      <ChartsIOButtons />
    </RunDetailsBox>
  );
};
