/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { Link, useMatch } from 'react-location';
import { useSelector } from 'react-redux';

import { CalculationRunTypeIndicator } from '@simint-app/components/models/CalculationList/CalculationRunTypeIndicator';
import { CalculationStatusIndicator } from '@simint-app/components/models/CalculationList/CalculationStatusIndicator';
import { CalculationTimeLabel } from '@simint-app/components/models/CalculationList/CalculationTimeLabel';
import type { AppLocationGenerics } from '@simint-app/routes';
import { selectProject } from '@simint-app/store/simconfigApiProperties/selectors';
import { createCdfLink } from '@simint-app/utils/createCdfLink';

import {
  Button,
  Chip,
  Divider,
  Dropdown,
  Menu,
  Skeleton,
} from '@cognite/cogs.js';
import type { CalculationRun } from '@cognite/simconfig-api-sdk/rtk';
import { useGetCalculationQuery } from '@cognite/simconfig-api-sdk/rtk';

import { CalculationRunsListContainer } from './styles';

interface CalculationRunListProps extends React.HTMLAttributes<HTMLDivElement> {
  calculationRuns: CalculationRun[];
  isFetchingCalculationsRunList: boolean;
}

export function CalculationRunList({
  calculationRuns,
  isFetchingCalculationsRunList,
  onScroll,
}: CalculationRunListProps) {
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  return (
    <CalculationRunsListContainer onScroll={onScroll}>
      {calculationRuns.map((run) => {
        const timestamps = {
          calcTime: run.metadata.calcTime,
          createdTime: run.createdTime,
          endTime: run.endTime,
          lastUpdatedTime: run.lastUpdatedTime,
          startTime: run.startTime,
        };
        return (
          <div className="grid-row" key={run.id}>
            <span className="simulators">
              {definitions?.simulatorsConfig?.filter(
                ({ key }) => key === run.source
              )?.[0]?.name ?? run.source}
            </span>
            <span className="model-name">{run.metadata.modelName}</span>

            <span className="model-version">
              {run.metadata.modelVersion ? (
                <Chip
                  label={`v${run.metadata.modelVersion}`}
                  size="x-small"
                  type="default"
                  hideTooltip
                />
              ) : null}
            </span>

            <span className="calculation-name">{run.metadata.calcName}</span>

            <div className="col-status">
              <CalculationRunTypeIndicator
                runType={run.metadata.runType}
                userEmail={run.metadata.userEmail}
              />
              <CalculationStatusIndicator
                status={run.metadata.status}
                statusMessage={run.metadata.statusMessage}
              />
            </div>

            <span className="date">
              <CalculationTimeLabel {...timestamps} />
            </span>

            <div>
              <Dropdown content={<ExpansionMenu run={run} />}>
                <Button
                  aria-label="Actions"
                  icon="EllipsisHorizontal"
                  size="small"
                />
              </Dropdown>
            </div>
          </div>
        );
      })}
      {isFetchingCalculationsRunList ? <Skeleton.List lines={5} /> : null}
    </CalculationRunsListContainer>
  );
}

function ExpansionMenu({ run }: { run: CalculationRun }) {
  const project = useSelector(selectProject);
  const externalId = run.metadata.calcConfig;
  const eventId = run.id?.toString();
  const calculationType = run.metadata.calcTypeUserDefined ?? '';

  const { data: chartLinks, isFetching: isFetchingChartLinks } =
    useGetCalculationQuery({
      project,
      externalId,
      eventId,
    });

  return (
    <Menu>
      <Link to={createCdfLink(`${run.id}`)}>
        <Menu.Item icon="Info" iconPlacement="left">
          Calculation run details
        </Menu.Item>
      </Link>
      <Divider />
      {isFetchingChartLinks ? (
        <Menu.Item>
          <Skeleton.Text />
        </Menu.Item>
      ) : (
        <a
          href={chartLinks?.timeSeriesChartsLink}
          rel="noreferrer"
          target="_blank"
        >
          <Menu.Item icon="LineChart" iconPlacement="left">
            Open timeseries in Charts
          </Menu.Item>
        </a>
      )}
      <Divider />
      <Link
        to={createCdfLink(
          `/model-library/models/${encodeURIComponent(
            run.metadata.simulator
          )}/${encodeURIComponent(run.metadata.modelName)}`
        )}
      >
        <Menu.Item icon="DataSource" iconPlacement="left">
          View model
        </Menu.Item>
      </Link>
      <Link
        to={createCdfLink(`/model-library/models/${encodeURIComponent(
          run.metadata.simulator
        )}/${encodeURIComponent(
          run.metadata.modelName
        )}/calculations/${encodeURIComponent(run.metadata.calcType)}
        /${run.metadata.calcType === 'UserDefined' ? calculationType : ''}`)}
      >
        <Menu.Item icon="Settings" iconPlacement="left">
          View configuration
        </Menu.Item>
      </Link>
    </Menu>
  );
}
