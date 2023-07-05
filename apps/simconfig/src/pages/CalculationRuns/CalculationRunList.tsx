import React from 'react';
import { Link, useMatch } from 'react-location';
import { useSelector } from 'react-redux';

import { Button, Dropdown, Icon, Menu, Skeleton } from '@cognite/cogs.js';
import { Chip } from '@cognite/cogs.js-v9';
import type { CalculationRun } from '@cognite/simconfig-api-sdk/rtk';
import { useGetCalculationQuery } from '@cognite/simconfig-api-sdk/rtk';

import { CalculationRunTypeIndicator } from 'components/models/CalculationList/CalculationRunTypeIndicator';
import { CalculationStatusIndicator } from 'components/models/CalculationList/CalculationStatusIndicator';
import { CalculationTimeLabel } from 'components/models/CalculationList/CalculationTimeLabel';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import { createCdfLink } from 'utils/createCdfLink';

import { CalculationRunsListContainer } from './styles';

import type { AppLocationGenerics } from 'routes';

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
        <Menu.Item>
          <Icon type="Info" /> Calculation run details
        </Menu.Item>
      </Link>
      <Menu.Divider />
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
          <Menu.Item>
            <Icon type="LineChart" /> Open timeseries in Charts
          </Menu.Item>
        </a>
      )}
      <Menu.Divider />
      <Link
        to={createCdfLink(
          `/model-library/models/${encodeURIComponent(
            run.metadata.simulator
          )}/${encodeURIComponent(run.metadata.modelName)}`
        )}
      >
        <Menu.Item>
          <Icon type="DataSource" /> View model
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
        <Menu.Item>
          <Icon type="Settings" /> View configuration
        </Menu.Item>
      </Link>
    </Menu>
  );
}
