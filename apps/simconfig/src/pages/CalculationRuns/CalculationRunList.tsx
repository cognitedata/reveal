import { useState } from 'react';

import {
  formatDuration,
  formatISO9075,
  intervalToDuration,
  parseISO,
} from 'date-fns';
import styled from 'styled-components/macro';

import { Collapse, Icon, Label, Skeleton } from '@cognite/cogs.js';
import type { CalculationRun } from '@cognite/simconfig-api-sdk/rtk';

import { CalculationRunTypeIndicator } from 'components/models/CalculationList/CalculationRunTypeIndicator';
import { CalculationStatusIndicator } from 'components/models/CalculationList/CalculationStatusIndicator';

import { CalculationRunChartButtons } from '../CalculationRuns/CalculationRunChartButtons';

const formatCalculationDate = (date?: string) =>
  date ? formatISO9075(parseISO(date)) : 'n/a';

const formatCalculationDuration = (start?: string, end?: string) =>
  start && end
    ? formatDuration(
        intervalToDuration({
          start: parseISO(start),
          end: parseISO(end),
        })
      ) || '-'
    : 'n/a';

interface CalculationRunListProps extends React.HTMLAttributes<HTMLDivElement> {
  calculationRuns: CalculationRun[];
  isFetchingCalculationsRunList: boolean;
}

export function CalculationRunList({
  calculationRuns,
  isFetchingCalculationsRunList,
  onScroll,
}: CalculationRunListProps) {
  const [activeTab, setActiveTab] = useState<string | null>();
  return (
    <CalculationRunsListContainer onScroll={onScroll}>
      <Collapse
        accordion
        onChange={(currentTab) => {
          setActiveTab(currentTab);
        }}
      >
        {calculationRuns.map((run) => (
          <Collapse.Panel
            header={
              <CollapseCommonContainer>
                <span className="model-name">
                  {run.metadata.modelName}{' '}
                  {run.metadata.modelVersion ? (
                    <Label size="small" variant="unknown">
                      v{run.metadata.modelVersion}
                    </Label>
                  ) : null}
                </span>
                <span className="calculation-name">
                  {run.metadata.calcName}
                </span>
                <span className="status">
                  <CalculationRunTypeIndicator
                    runType={run.metadata.runType}
                    userEmail={run.metadata.userEmail}
                  />
                  <CalculationStatusIndicator
                    status={run.metadata.status}
                    statusMessage={run.metadata.statusMessage}
                  />
                </span>
                <span className="date">
                  {formatCalculationDate(run.lastUpdatedTime)}
                </span>
              </CollapseCommonContainer>
            }
            key={run.id}
          >
            <RunDetailsList>
              <dt>
                <Icon type="User" /> User
              </dt>
              <dd>{run.metadata.userEmail ?? 'n/a'}</dd>

              <dt>Simulation event created</dt>
              <dd>{formatCalculationDate(run.lastUpdatedTime)}</dd>

              <dt>Total duration</dt>
              <dd>{formatCalculationDuration(run.endTime, run.createdTime)}</dd>

              <dt>Simulation started</dt>
              <dd>{formatCalculationDate(run.startTime)}</dd>

              <dt>Simulation duration</dt>
              <dd>{formatCalculationDuration(run.endTime, run.startTime)}</dd>

              {run.metadata.status === 'failure' && (
                <>
                  <dt>Error message</dt>
                  <dd>{run.metadata.statusMessage}</dd>
                </>
              )}
            </RunDetailsList>
            {activeTab === run.id?.toString() &&
              run.metadata.status === 'success' && (
                <CalculationRunChartButtons calculationRun={run} />
              )}
          </Collapse.Panel>
        ))}
      </Collapse>
      {isFetchingCalculationsRunList ? <Skeleton.List lines={5} /> : null}
    </CalculationRunsListContainer>
  );
}

const CalculationRunsListContainer = styled.div`
  overflow: auto;
  padding: 0 24px;
`;

const CollapseCommonContainer = styled.div`
  display: flex;
  flex: 1 0 auto;
  line-height: 1;
  & > span {
    flex: 1 0 0;
    display: flex;
    align-items: center;
    column-gap: 6px;
  }
  .calculation-name {
    max-width: 240px;
  }
  .status {
    max-width: 120px;
  }
  .date {
    max-width: 160px;
  }
`;

export const RunDetailsList = styled.dl`
  display: grid;
  grid-template-columns: 240px auto;
  gap: 4px;
  align-items: end;
  dt,
  dd {
    display: flex;
    align-items: center;
    column-gap: 6px;
  }
`;
