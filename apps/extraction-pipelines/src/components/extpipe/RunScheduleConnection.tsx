import React, { FunctionComponent } from 'react';
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
import {
  addIfExist,
  calculateLatest,
  calculateStatus,
} from 'utils/extpipeUtils';
import { RunStatusUI } from 'model/Status';
import { useRuns } from 'hooks/useRuns';
import {
  and,
  filterByStatus,
  filterByTimeBetween,
  filterRuns,
  isWithinDaysInThePast,
} from 'utils/runsUtils';
import { RunUI } from 'model/Runs';
import moment from 'moment';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import { useLocation, useRouteMatch } from 'react-router-dom';
import { HEALTH_PATH } from 'routing/RoutingConfig';
import { useTranslation } from 'common';

export const RunScheduleConnection: FunctionComponent = () => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const { url } = useRouteMatch();
  const { extpipe: selectedExtpipe } = useSelectedExtpipe();
  const { data: extpipe } = useExtpipeById(selectedExtpipe?.id);
  const { data: runsData, status: runsStatus } = useRuns(extpipe?.externalId);

  const runs = filterRuns(runsData?.items);
  const errorsInThePastWeek = runs.filter(
    and<RunUI>(filterByStatus(RunStatusUI.FAILURE), isWithinDaysInThePast(7))
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
    lastSuccess: extpipe?.lastSuccess,
    lastFailure: extpipe?.lastFailure,
  });
  const lastConnected = calculateLatest([
    ...addIfExist(extpipe?.lastSeen),
    ...addIfExist(extpipe?.lastSuccess),
    ...addIfExist(extpipe?.lastFailure),
  ]);

  return (
    <CardWrapper className={`${lastRun.status.toLowerCase()} z-2`}>
      <CardNavLink to={`${url}/${HEALTH_PATH}${search}`} exact>
        <CardInWrapper>
          <StyledTitleCard className="card-title">
            <Icon type="Calendar" />
            {t('last-run-time')}
          </StyledTitleCard>
          <CardValue className="card-value">
            <TimeDisplay value={lastRun.time} relative />
          </CardValue>
          <Icon type="ArrowRight" />
        </CardInWrapper>
      </CardNavLink>
      <CardInWrapper>
        <StyledTitleCard className="card-title">
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
