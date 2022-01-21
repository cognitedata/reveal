import { useState } from 'react';

import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  formatISO9075,
} from 'date-fns';
import styled from 'styled-components/macro';

import { Collapse, Icon, Label } from '@cognite/cogs.js';
import type { Timestamp } from '@cognite/sdk';
import type { CalculationRun } from '@cognite/simconfig-api-sdk/rtk';

import { CalculationRunChartButtons } from './CalculationRunChartButtons';
import { StatusColors } from './types';

const formatDate = (date: number) => formatISO9075(new Date(date));

const subtractDateDifference = (
  start: Timestamp | number | undefined,
  end: Timestamp | number | undefined
) => {
  if (!start || !end) {
    return 'N/A';
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days = differenceInDays(startDate, endDate);
  const hours = differenceInHours(startDate, endDate);
  const minutes = differenceInMinutes(startDate, endDate);
  const seconds = differenceInSeconds(startDate, endDate) % 60;
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

export function CalculationRunsList({
  calculationRuns,
}: {
  calculationRuns: CalculationRun[];
}) {
  const [activeTab, setActiveTab] = useState<string | null>();
  return (
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
              <span>
                {run.metadata.modelName} v{run.metadata.modelVersion}
              </span>
              <span>{run.metadata.calcName}</span>
              <span>{run.metadata.runType}</span>
              <span>
                <Label size="small" variant={StatusColors[run.metadata.status]}>
                  {run.metadata.status}
                </Label>
              </span>
              <span>{formatDate(run.lastUpdatedTime ?? 0)}</span>
            </CollapseCommonContainer>
          }
          key={run.id}
        >
          <RunDetailsTable>
            <dt>
              <Icon type="User" /> User
            </dt>
            <dd>{run.metadata.userEmail ?? 'N/A'}</dd>

            <dt>Simulation event created</dt>
            <dd>{formatDate(run.lastUpdatedTime ?? 0)}</dd>

            <dt>Total duration</dt>
            <dd>{subtractDateDifference(run.endTime, run.createdTime)}</dd>

            <dt>Simulation started</dt>
            <dd>{formatDate(run.startTime ?? 0)}</dd>

            <dt>Duration</dt>
            <dd>{subtractDateDifference(run.endTime, run.startTime)}</dd>

            {run.metadata.status === 'failure' && (
              <>
                <dt>Error message</dt>
                <dd>{run.metadata.statusMessage}</dd>
              </>
            )}
          </RunDetailsTable>
          {activeTab === run.id?.toString() &&
            run.metadata.status === 'success' && (
              <CalculationRunChartButtons calculationRun={run} />
            )}
        </Collapse.Panel>
      ))}
    </Collapse>
  );
}

const CollapseCommonContainer = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
`;

export const RunDetailsTable = styled.dl`
  width: 50%;
  display: grid;
  grid-template-columns: auto max-content;
  align-items: center;
  align-content: center;
  dd,
  dt {
    margin-bottom: 0.1em;
  }
  dt,
  dd {
    display: table-cell;
    vertical-align: middle;
  }
  dt {
    grid-column-start: 1;
    margin-top: 2px;
  }

  dd {
    grid-column-start: 2;
    margin: 0;
    text-align: right;
    padding-right: 1em;
  }
`;
