import React from 'react';
import { Link, useRouter } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import {
  Button,
  Dropdown,
  Icon,
  Label,
  Menu,
  Skeleton,
} from '@cognite/cogs.js';
import type { CalculationRun } from '@cognite/simconfig-api-sdk/rtk';
import { useGetCalculationQuery } from '@cognite/simconfig-api-sdk/rtk';

import { CalculationRunTypeIndicator } from 'components/models/CalculationList/CalculationRunTypeIndicator';
import { CalculationStatusIndicator } from 'components/models/CalculationList/CalculationStatusIndicator';
import { CalculationTimeLabel } from 'components/models/CalculationList/CalculationTimeLabel';
import { selectProject } from 'store/simconfigApiProperties/selectors';

interface CalculationRunListProps extends React.HTMLAttributes<HTMLDivElement> {
  calculationRuns: CalculationRun[];
  isFetchingCalculationsRunList: boolean;
}

export function CalculationRunList({
  calculationRuns,
  isFetchingCalculationsRunList,
  onScroll,
}: CalculationRunListProps) {
  const router = useRouter();
  const sourceQuery = JSON.stringify(router.state.location.search);
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
          <React.Fragment key={run.id}>
            <span className="model-name">{run.metadata.modelName}</span>

            <span className="model-version">
              {run.metadata.modelVersion ? (
                <Label size="small" variant="unknown">
                  v{run.metadata.modelVersion}
                </Label>
              ) : null}
            </span>

            <span className="calculation-name">{run.metadata.calcName}</span>

            <CalculationRunTypeIndicator
              runType={run.metadata.runType}
              userEmail={run.metadata.userEmail}
            />

            <CalculationStatusIndicator
              status={run.metadata.status}
              statusMessage={run.metadata.statusMessage}
            />

            <span className="date">
              <CalculationTimeLabel {...timestamps} />
            </span>

            <div>
              <Dropdown
                content={<ExpansionMenu run={run} sourceQuery={sourceQuery} />}
              >
                <Button
                  aria-label="Actions"
                  icon="EllipsisHorizontal"
                  size="small"
                />
              </Dropdown>
            </div>
          </React.Fragment>
        );
      })}
      {isFetchingCalculationsRunList ? <Skeleton.List lines={5} /> : null}
    </CalculationRunsListContainer>
  );
}

const CalculationRunsListContainer = styled.div`
  overflow: auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: auto auto 1fr auto auto auto auto;
  grid-gap: 6px 12px;
  align-items: center;
  .cogs-tooltip__content {
    cursor: help;
    display: flex;
    column-gap: 6px;
    align-items: center;
  }
`;

function ExpansionMenu({
  run,
  sourceQuery,
}: {
  run: CalculationRun;
  sourceQuery: string;
}) {
  const project = useSelector(selectProject);
  const externalId = run.metadata.calcConfig;
  const eventId = run.id?.toString();
  const { data: chartLinks, isFetching: isFetchingChartLinks } =
    useGetCalculationQuery({
      project,
      externalId,
      eventId,
    });

  return (
    <Menu>
      <Link search={{ sourceQuery }} to={run.id}>
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
        <a href={chartLinks?.inputLink} rel="noreferrer" target="_blank">
          <Menu.Item>
            <Icon type="LineChart" /> Open inputs in Charts
          </Menu.Item>
        </a>
      )}
      {isFetchingChartLinks ? (
        <Menu.Item>
          <Skeleton.Text />
        </Menu.Item>
      ) : (
        <a href={chartLinks?.outputLink} rel="noreferrer" target="_blank">
          <Menu.Item>
            <Icon type="LineChart" /> Open outputs in Charts
          </Menu.Item>
        </a>
      )}
      <Menu.Divider />
      <Link
        to={`/model-library/models/${encodeURIComponent(
          run.metadata.simulator
        )}/${encodeURIComponent(run.metadata.modelName)}`}
      >
        <Menu.Item>
          <Icon type="DataSource" /> View model
        </Menu.Item>
      </Link>
      <Link
        to={`/model-library/models/${encodeURIComponent(
          run.metadata.simulator
        )}/${encodeURIComponent(
          run.metadata.modelName
        )}/calculations/${encodeURIComponent(run.metadata.calcType)}`}
      >
        <Menu.Item>
          <Icon type="Settings" /> View configuration
        </Menu.Item>
      </Link>
    </Menu>
  );
}
