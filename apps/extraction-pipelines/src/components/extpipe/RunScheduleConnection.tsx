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
import moment from 'moment';
import { useSelectedExtpipe } from 'hooks/useExtpipe';
import { useLocation } from 'react-router-dom';
import { HEALTH_PATH } from 'routing/RoutingConfig';
import { useTranslation } from 'common';
import { RunApi } from 'model/Runs';

export const RunScheduleConnection = ({
  externalId,
}: {
  externalId: string;
}) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const { data: extpipe } = useSelectedExtpipe();
  const { data, status: runsStatus } = useAllRuns({ externalId });

  const allRuns = useMemo(
    () =>
      data?.pages
        .map((p) => p.items)
        .reduce((accl, p) => [...accl, ...p], []) || [],
    [data?.pages]
  );

  const { data: last30DayPages } = useAllRuns({
    externalId,
    dateRange: {
      startDate: moment().subtract(30, 'days').startOf('day').toDate(),
      endDate: moment().endOf('day').toDate(),
    },
  });

  const [last30Days, last30DaysSuccess] = useMemo(() => {
    const runs =
      last30DayPages?.pages.reduce(
        (accl, p) => [...accl, ...p.items],
        [] as RunApi[]
      ) || [];
    const success = runs.filter((r) => r.status === 'success').length;
    const fails = runs.filter((r) => r.status === 'failure').length;
    return [success + fails, success];
  }, [last30DayPages]);

  const lastRun = allRuns[0];

  const lastConnected = calculateLatest([
    ...addIfExist(extpipe?.lastSeen),
    ...addIfExist(extpipe?.lastSuccess),
    ...addIfExist(extpipe?.lastFailure),
  ]);

  const lastRunTimeStamp = calculateLatest([
    ...addIfExist(extpipe?.lastSuccess),
    ...addIfExist(extpipe?.lastFailure),
  ]);

  const { format } = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'percent',
      }),
    []
  );

  if (!lastRun) {
    return null;
  }

  return (
    <CardWrapper className={`${lastRun.status.toLowerCase()} z-2`}>
      <CardNavLink to={`${HEALTH_PATH}${search}`}>
        <CardInWrapper>
          <StyledTitleCard
            className="card-title"
            data-testid="last-run-time-text"
          >
            <Icon type="Calendar" />
            {t('last-run-time')}
          </StyledTitleCard>
          <CardValue className="card-value">
            <TimeDisplay value={lastRunTimeStamp} relative />
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
            <Tag color="success">{last30DaysSuccess}</Tag>
            {t('successful-runs-30-days')}
          </StyledTitleCard>
          {last30Days > 0 && (
            <CardValue className="card-value">
              {t('successful-runs-30-days-percentage', {
                percentage: format(last30DaysSuccess / last30Days),
              })}
            </CardValue>
          )}
        </CardInWrapper>
      )}
      <CardNavLink to={`${HEALTH_PATH}${search}`}>
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
