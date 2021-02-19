import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import styled from 'styled-components';
import { Colors, Tag } from '@cognite/cogs.js';
import { NavLink, useLocation, useRouteMatch } from 'react-router-dom';
import { TableHeadings } from '../table/IntegrationTableCol';
import StatusMarker from '../integrations/cols/StatusMarker';
import { AbsoluteRelativeTime } from '../TimeDisplay/AbsoluteRelativeTime';
import { calculateStatus } from '../../utils/integrationUtils';
import { Status } from '../../model/Status';
import { DivFlex } from '../../styles/flex/StyledFlex';
import { Integration } from '../../model/Integration';
import { DetailWrapper } from './IntegrationView';
import { useRuns } from '../../hooks/useRuns';
import { ErrorFeedback } from '../error/ErrorFeedback';
import {
  and,
  filterByStatus,
  filterRuns,
  isWithinDaysInThePast,
} from '../../utils/runsUtils';
import { StatusRun } from '../../model/Runs';

const LatestRunWrapper = styled((props) => (
  <DetailWrapper {...props}>{props.children}</DetailWrapper>
))`
  display: flex;
  flex-direction: column;
  .error-message {
    padding: 1rem;
    white-space: pre-wrap;
    border: 0.125rem solid ${Colors['greyscale-grey2'].hex()};
  }
`;

interface RunViewProps {
  integration: Integration;
}

export const RunView: FunctionComponent<RunViewProps> = ({
  integration,
}: PropsWithChildren<RunViewProps>) => {
  const { url } = useRouteMatch();
  const { search } = useLocation();
  const [showFailures, setShowFailures] = useState(false);
  const { data, error } = useRuns(integration?.externalId);
  if (error) {
    return <ErrorFeedback error={error} />;
  }

  const errorsInThePastWeek = filterRuns(data?.items).filter(
    and<StatusRun>(filterByStatus(Status.FAIL), isWithinDaysInThePast(7))
  );

  const lastRun = calculateStatus({
    lastSuccess: integration.lastSuccess,
    lastFailure: integration.lastFailure,
  });

  const renderErrorMessage = (status: Status, message?: string) => {
    if (status !== Status.FAIL) {
      return <></>;
    }
    return (
      <DivFlex direction="column" align="flex-start">
        <span className="info-label">Latest error message:</span>
        {message ? (
          <pre className="error-message">{integration.lastMessage}</pre>
        ) : (
          <i>No error message received</i>
        )}
      </DivFlex>
    );
  };

  return (
    <LatestRunWrapper className={`${lastRun.status.toLowerCase()}`}>
      <h2>
        {TableHeadings.LATEST_RUN} <StatusMarker status={lastRun.status} />
      </h2>
      <i className="additional-info">
        Status information from the last time the integration executed
      </i>
      <span className="info-field">
        <span className="info-label">Time since last run: </span>
        <AbsoluteRelativeTime value={lastRun.time} />
      </span>
      {renderErrorMessage(lastRun.status, integration.lastMessage)}
      <p>
        Errors within the past week:{' '}
        <Tag
          color="danger"
          ghost
          onClick={() => setShowFailures(!showFailures)}
        >
          {errorsInThePastWeek.length}
        </Tag>
      </p>
      {showFailures && (
        <pre>
          {errorsInThePastWeek.map(({ createdTime, message }) => {
            return (
              <p key={createdTime}>
                <AbsoluteRelativeTime value={createdTime} /> - {message}
              </p>
            );
          })}
        </pre>
      )}
      <NavLink to={`${url}/logs${search}`} exact className="tab-link">
        View runs
      </NavLink>
    </LatestRunWrapper>
  );
};
