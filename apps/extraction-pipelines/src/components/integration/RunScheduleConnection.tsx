import React, { FunctionComponent } from 'react';
import { Icon, Tag } from '@cognite/cogs.js';
import { TimeDisplay } from 'components/TimeDisplay/TimeDisplay';
import Schedule from 'components/integrations/cols/Schedule';
import {
  CardInWrapper,
  CardNavLink,
  CardValue,
  CardWrapper,
  StyledTitleCard,
} from 'styles/StyledCard';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { calculateStatus } from 'utils/integrationUtils';
import { RunStatusUI } from 'model/Status';
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
import { useIntegrationById } from 'hooks/useIntegration';
import { LatestRunMessage } from 'components/integration/LatestRunMessage';
import { ErrorFeedback } from 'components/error/ErrorFeedback';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { HEALTH_PATH } from 'routing/RoutingConfig';

export const FAILED_PAST_WEEK_HEADING: Readonly<string> =
  'Failed runs past week';
export const RunScheduleConnection: FunctionComponent = () => {
  const { search } = useLocation();
  const { url } = useRouteMatch();
  const { integration: selectedIntegration } = useSelectedIntegration();
  const { data: integration } = useIntegrationById(selectedIntegration?.id);
  const { data, error } = useRuns(integration?.externalId);
  if (error) {
    return <ErrorFeedback error={error} />;
  }
  const runs = filterRuns(data?.items);
  const errorsInThePastWeek = runs.filter(
    and<StatusRun>(
      filterByStatus(RunStatusUI.FAILURE),
      isWithinDaysInThePast(7)
    )
  );
  const errorLastWeek = runs.filter(
    and(
      filterByStatus(RunStatusUI.FAILURE),
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
      <CardNavLink to={`${url}/${HEALTH_PATH}${search}`} exact>
        <CardInWrapper>
          <StyledTitleCard className="card-title">
            <Icon type="Calendar" />
            {TableHeadings.LATEST_RUN_TIME}
            <LatestRunMessage
              status={lastRun.status}
              message={integration?.lastMessage}
            />
          </StyledTitleCard>
          <CardValue className="card-value">
            <TimeDisplay value={lastRun.time} relative />
          </CardValue>
          <Icon type="ArrowForward" />
        </CardInWrapper>
      </CardNavLink>
      <CardInWrapper>
        <StyledTitleCard className="card-title">
          <Icon type="Schedule" />
          {TableHeadings.SCHEDULE}
        </StyledTitleCard>
        <CardValue className="card-value">
          <Schedule id="top-schedule" schedule={integration?.schedule} />
        </CardValue>
      </CardInWrapper>
      <CardInWrapper>
        <StyledTitleCard className="card-title">
          <Tag color="danger">{errorsInThePastWeek.length}</Tag>
          {FAILED_PAST_WEEK_HEADING}
        </StyledTitleCard>
        <CardValue className="card-value">
          {errorsComparedToLastWeek} runs compared to last week
        </CardValue>
      </CardInWrapper>
      <CardNavLink to={`${url}/${HEALTH_PATH}${search}`} exact>
        <CardInWrapper>
          <StyledTitleCard className="card-title">
            <Icon type="Checkmark" />
            {TableHeadings.LAST_SEEN}
          </StyledTitleCard>
          <CardValue className="card-value">
            {integration?.lastSeen && (
              <TimeDisplay value={integration.lastSeen} relative />
            )}
          </CardValue>
          <Icon type="ArrowForward" />
        </CardInWrapper>
      </CardNavLink>
    </CardWrapper>
  );
};
