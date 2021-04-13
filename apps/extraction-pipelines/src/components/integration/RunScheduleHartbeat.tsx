import React, { FunctionComponent } from 'react';
import { Icon, Tag } from '@cognite/cogs.js';
import { TimeDisplay } from 'components/TimeDisplay/TimeDisplay';
import Schedule from 'components/integrations/cols/Schedule';
import {
  CardInWrapper,
  CardValue,
  CardWrapper,
  StyledTitleCard,
} from 'styles/StyledCard';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import StatusMarker from 'components/integrations/cols/StatusMarker';
import { calculateStatus } from 'utils/integrationUtils';
import { Status } from 'model/Status';
import { useRuns } from 'hooks/useRuns';
import {
  and,
  filterByStatus,
  filterByTimeBetween,
  filterRuns,
  isWithinDaysInThePast,
} from 'utils/runsUtils';
import { StatusRun } from 'model/Runs';
import moment from 'moment';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { ErrorFeedback } from '../error/ErrorFeedback';

export const INVESTIGATE_RUN_LINK: Readonly<string> = 'Investigate latest runs';
export const GENERAL_INFO_LINK: Readonly<string> = 'View general info';
export const RUNS_OVERVIEW_LINK: Readonly<string> = 'Overview runs';
export const HARTBEAT_HEADING: Readonly<string> = 'Hartbeat (last seen)';
export const HARTBEAT_LINK: Readonly<string> = 'Overview hartbeat';

export const RunScheduleHartbeat: FunctionComponent = () => {
  const { integration } = useSelectedIntegration();
  const { data, error } = useRuns(integration?.externalId);
  if (error) {
    return <ErrorFeedback error={error} />;
  }
  const runs = filterRuns(data?.items);
  const errorsInThePastWeek = runs.filter(
    and<StatusRun>(filterByStatus(Status.FAIL), isWithinDaysInThePast(7))
  );
  const errorLastWeek = runs.filter(
    and(
      filterByStatus(Status.FAIL),
      filterByTimeBetween(
        moment().subtract(14, 'days'),
        moment().subtract(7, 'days')
      )
    )
  );
  const errorsComparedToLastWeek =
    errorsInThePastWeek.length - errorLastWeek.length;

  const lastRun = calculateStatus({
    lastSuccess: integration?.lastSuccess,
    lastFailure: integration?.lastFailure,
  });

  return (
    <CardWrapper className={`${lastRun.status.toLowerCase()}`}>
      <CardInWrapper>
        <StyledTitleCard>
          <Icon type="Calendar" />
          {TableHeadings.LATEST_RUN} <StatusMarker status={lastRun.status} />
        </StyledTitleCard>
        <CardValue>
          <TimeDisplay value={lastRun.time} relative />
        </CardValue>
        <a href="#latest-run-heading">{INVESTIGATE_RUN_LINK}</a>
      </CardInWrapper>
      <CardInWrapper>
        <StyledTitleCard>
          <Icon type="Schedule" />
          {TableHeadings.SCHEDULE}
        </StyledTitleCard>
        <CardValue>
          <Schedule id="top-schedule" schedule={integration?.schedule} />
        </CardValue>
        <a href="#general-info-heading">{GENERAL_INFO_LINK}</a>
      </CardInWrapper>
      <CardInWrapper>
        <StyledTitleCard>
          <Tag color="danger">{errorsInThePastWeek.length}</Tag>
          Failed runs past week
        </StyledTitleCard>
        <CardValue>
          {errorsComparedToLastWeek} runs compared to last week
        </CardValue>
        <a href="#overview-runs-heading">{RUNS_OVERVIEW_LINK}</a>
      </CardInWrapper>
      <CardInWrapper>
        <StyledTitleCard>
          <Icon type="Checkmark" />
          {HARTBEAT_HEADING}
        </StyledTitleCard>
        <CardValue>
          {integration?.lastSeen && (
            <TimeDisplay value={integration.lastSeen} relative />
          )}
        </CardValue>
        <a href="#overview-hartbeat-heading">{HARTBEAT_LINK}</a>
      </CardInWrapper>
    </CardWrapper>
  );
};
