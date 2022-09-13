import React, { useMemo } from 'react';
import { Icon, Tag } from '@cognite/cogs.js';
import { TimeDisplay } from 'components/TimeDisplay/TimeDisplay';
import Schedule from 'components/extpipes/cols/Schedule';
import {
  CardInWrapper,
  CardNavLink,
  CardValue,
  CardWrapper,
  StyledTitleCard,
} from 'components/styled';
import { addIfExist, calculateLatest } from 'utils/extpipeUtils';
import { useAllRuns } from 'hooks/useRuns';
import { filterByTimeBetween, isWithinDaysInThePast } from 'utils/runsUtils';
import moment from 'moment';
import { useSelectedExtpipe } from 'hooks/useExtpipe';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { HEALTH_PATH } from 'routing/RoutingConfig';
import { useTranslation } from 'common';

export const RunScheduleConnection = ({
  externalId,
}: {
  externalId: string;
}) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const { url } = useRouteMatch();
  const { data: extpipe } = useSelectedExtpipe();
  const { data, status: runsStatus } = useAllRuns({ externalId });

  const allRuns = useMemo(
    () =>
      data?.pages
        .map((p) => p.items)
        .reduce((accl, p) => [...accl, ...p], []) || [],
    [data?.pages]
  );

  const errorsInThePastWeek = allRuns.filter(
    (r) => r.status === 'failure' && isWithinDaysInThePast(7)(r)
  );
  const errorLastWeek = allRuns.filter(
    (r) =>
      r.status === 'failure' &&
      filterByTimeBetween(
        moment().subtract(14, 'days'),
        moment().subtract(7, 'days')
      )(r)
  );

  const errorsComparedToLastWeek =
    errorsInThePastWeek.length - errorLastWeek.length;

  const lastRun = allRuns[0];

  const lastConnected = calculateLatest([
    ...addIfExist(extpipe?.lastSeen),
    ...addIfExist(extpipe?.lastSuccess),
    ...addIfExist(extpipe?.lastFailure),
  ]);

  if (!lastRun) {
    return null;
  }

  return (
    <CardWrapper className={`${lastRun.status.toLowerCase()} z-2`}>
      <CardNavLink to={`${url}/${HEALTH_PATH}${search}`} exact>
        <CardInWrapper>
          <StyledTitleCard
            className="card-title"
            data-testid="last-run-time-text"
          >
            <Icon type="Calendar" />
            {t('last-run-time')}
          </StyledTitleCard>
          <CardValue className="card-value">
            <TimeDisplay value={lastRun.createdTime} relative />
          </CardValue>
          <Icon type="ArrowRight" />
        </CardInWrapper>
      </CardNavLink>
      <CardInWrapper>
        <StyledTitleCard className="card-title" data-testid="schedule-text">
          <Icon type="Clock" />
          {t('schedule')}
        </StyledTitleCard>
        <CardValue className="card-value">
          <Schedule id="top-schedule" schedule={extpipe?.schedule} />
        </CardValue>
      </CardInWrapper>
      {runsStatus === 'success' && (
        <CardInWrapper>
          <StyledTitleCard className="card-title">
            <Tag color="danger">{errorsInThePastWeek.length}</Tag>
            {t('failed-runs-past-week')}
          </StyledTitleCard>
          <CardValue className="card-value">
            {t('runs-compared-to-last-week', {
              count: errorsComparedToLastWeek,
            })}
          </CardValue>
        </CardInWrapper>
      )}
      <CardNavLink to={`${url}/${HEALTH_PATH}${search}`} exact>
        <CardInWrapper>
          <StyledTitleCard className="card-title">
            <Icon type="Checkmark" />
            {t('last-seen')}
          </StyledTitleCard>
          <CardValue className="card-value">
            {lastConnected && <TimeDisplay value={lastConnected} relative />}
          </CardValue>
          <Icon type="ArrowRight" />
        </CardInWrapper>
      </CardNavLink>
    </CardWrapper>
  );
};
