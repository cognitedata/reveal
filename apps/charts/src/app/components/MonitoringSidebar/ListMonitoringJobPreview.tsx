import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Col, Row } from 'antd';
import { format } from 'date-fns';
import { head } from 'lodash';

import { Button, Icon, toast, Body, Colors } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

import { useUserProfileQuery } from '../../common/providers/useUserProfileQuery';
import { MONITORING_THRESHOLD_ID } from '../../domain/monitoring/constants';
import { useSearchParam } from '../../hooks/navigation';
import { useTranslations } from '../../hooks/translations';
import { useChartAtom } from '../../models/chart/atom';
import {
  addChartThreshold,
  removeChartThreshold,
} from '../../models/chart/updates-threshold';
import { trackUsage } from '../../services/metrics';
import {
  MONITORING_SIDEBAR_HIGHLIGHTED_JOB,
  MONITORING_SIDEBAR_SHOW_ALERTS,
} from '../../utils/constants';
import { makeDefaultTranslations } from '../../utils/translations';
import Dropdown from '../Dropdown/Dropdown';

import { SubscriptionLoader } from './elements';
import {
  useListAlerts,
  useMonitoringJobsDelete,
  useMonitoringSubscripitionList,
  useMonitoringSubscriptionCreate,
  useMonitoringSubscriptionDelete,
} from './hooks';
import JobCondition from './JobCondition';
import { MonitoringJob } from './types';

const defaultTranslation = makeDefaultTranslations(
  'Delete',
  'Unable to delete monitoring job',
  'Monitoring Job deleted successfully',
  'Unable to subscribe',
  'Unable to unsubscribe',
  'History',
  'Last alert:',
  'None',
  'User ID not found'
);

type Props = {
  monitoringJob: MonitoringJob;
  timeseriesName?: string;
  showHighlightedBorder?: boolean;
  showLastAlert?: boolean;
  trackingInfo?: { filter?: string; folderName?: string };
};
const ListMonitoringJobPreview = ({
  monitoringJob,
  timeseriesName,
  showHighlightedBorder = true,
  showLastAlert = true,
  trackingInfo,
}: Props) => {
  const [chart, setChart] = useChartAtom();
  const { data: timeseriesDef } = useCdfItems<Timeseries>(
    'timeseries',
    [{ id: monitoringJob.model.timeseriesId }],
    false,
    { enabled: timeseriesName === undefined }
  );
  const { data: userProfile } = useUserProfileQuery();

  const [monitoringJobIdParam, setMonitoringJobIdParam] = useSearchParam(
    MONITORING_SIDEBAR_HIGHLIGHTED_JOB
  );

  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'MonitoringSidebar').t,
  };

  const {
    data: alerts,
    isFetching: isFetchingAlerts,
    isFetched: fetchedAlerts,
  } = useListAlerts(`${monitoringJob.id}`);

  const {
    mutate: deleteMonitoringJob,
    isSuccess: deleteMonitoringJobSuccess,
    isError: deleteMonitoringJobError,
    error: deleteMonitoringJobErrorMsg,
  } = useMonitoringJobsDelete();

  const {
    mutate: createSubscription,
    // isSuccess: createSubscriptionSuccess,
    isError: createSubscriptionError,
    isLoading: createSubscriptionLoading,
    // error: deleteMonitoringJobErrorMsg,
  } = useMonitoringSubscriptionCreate();

  const {
    mutate: deleteSubscription,
    // isSuccess: deleteSubscriptionSuccess,
    isError: deleteSubscriptionError,
    isLoading: deleteSubscriptionLoading,
    // error: deleteMonitoringJobErrorMsg,
  } = useMonitoringSubscriptionDelete();

  const subscribeErrorText = t['Unable to subscribe'];
  const deleteSubscribeErrorText = t['Unable to unsubscribe'];

  useEffect(() => {
    if (createSubscriptionError) {
      toast.error(subscribeErrorText);
    }
    if (deleteSubscriptionError) {
      toast.error(deleteSubscribeErrorText);
    }
  }, [deleteSubscriptionError, createSubscriptionError]);

  const { data: subscriptionResponse, isLoading: subscriptionStatusLoading } =
    useMonitoringSubscripitionList(
      [monitoringJob.id],
      [monitoringJob.channelId],
      userProfile ? [userProfile] : []
    );

  useEffect(() => {
    if (deleteMonitoringJobError) {
      toast.error(t['Unable to delete monitoring job']);
    }
    if (deleteMonitoringJobSuccess) {
      toast.success(t['Monitoring Job deleted successfully']);
    }
  }, [
    deleteMonitoringJobError,
    deleteMonitoringJobErrorMsg,
    deleteMonitoringJobSuccess,
  ]);

  const isSubscribed =
    subscriptionResponse && subscriptionResponse[monitoringJob.id];

  const name = timeseriesName || (timeseriesDef && head(timeseriesDef)?.name);
  const { id, externalId } = monitoringJob;

  const handleToggleSubscription = () => {
    let event;
    if (!isSubscribed) {
      createSubscription({
        channelID: monitoringJob.channelId,
        subscribers: userProfile ? [userProfile] : [],
      });
      event = 'Sidebar.Monitoring.Subscribe';
    } else {
      deleteSubscription({
        channelID: monitoringJob.channelId,
        subscribers: userProfile ? [userProfile] : [],
      });
      event = 'Sidebar.Monitoring.Unsubscribe';
    }

    trackUsage(event, {
      monitoringJob: externalId,
      folder: trackingInfo?.folderName,
      filter: trackingInfo?.filter,
    });
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isHighlighted, setisHighlighted] = useState(
    showHighlightedBorder && Number(monitoringJobIdParam || 0) === id
  );

  useEffect(() => {
    const targetTimeseries = chart?.timeSeriesCollection?.find(
      (timeSeries) => timeSeries.tsId === monitoringJob.model.timeseriesId
    );

    if (targetTimeseries) {
      const thresholdId = `${MONITORING_THRESHOLD_ID}-${monitoringJob.id}`;
      if (isHighlighted) {
        setChart((oldChart) =>
          addChartThreshold(oldChart!, {
            id: thresholdId,
            name: thresholdId,
            visible: true,
            sourceId: targetTimeseries.id,
            upperLimit: monitoringJob.model.upperThreshold,
            type: 'under',
            filter: {},
            addedBy: 'monitoringSidebar',
            color: '#BF0A36',
          })
        );
      } else {
        setChart((oldChart) => {
          const chartWithoutTHreshold = removeChartThreshold(
            oldChart!,
            thresholdId
          );
          return chartWithoutTHreshold;
        });
      }
    }
  }, [chart?.timeSeriesCollection, isHighlighted, monitoringJob, setChart]);

  const [, setShowAlerts] = useSearchParam(MONITORING_SIDEBAR_SHOW_ALERTS);
  const handleClickAlerts = () => {
    setShowAlerts('true');
    setMonitoringJobIdParam(`${id}`);
    trackUsage('Sidebar.Monitoring.AlertHistory', {
      monitoringJob: externalId,
      folder: trackingInfo?.folderName,
      filter: trackingInfo?.filter,
    });
  };

  const lastAlert = head(alerts?.slice(0, 1));
  const lastAlertdate =
    lastAlert &&
    format(new Date(Number(lastAlert.lastTriggeredTime)), 'dd/MM/yyyy');

  return (
    <MonitoringJobPreview
      key={externalId}
      onClick={() => {
        setisHighlighted(!isHighlighted);
      }}
      style={
        isHighlighted
          ? {
              border:
                '1px solid var(--border-interactive-toggled-pressed, #2B3A88)',
            }
          : {}
      }
    >
      <HeaderRow>
        <WrappedTimeseriesName span={18}>
          <TimeseriesIcon type="Timeseries" />
          {name}
        </WrappedTimeseriesName>
        <Col offset={1} />
        <Col span={2}>
          {createSubscriptionLoading ||
          deleteSubscriptionLoading ||
          subscriptionStatusLoading ? (
            <SubscriptionLoader type="Loader" />
          ) : (
            <ActionButton
              size="small"
              icon={isSubscribed ? 'BellFilled' : 'Bell'}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleSubscription();
              }}
            />
          )}
        </Col>
        <Col span={2}>
          <Dropdown
            open={isOpen}
            options={[
              {
                label: t.Delete,
                onClick: () => {
                  deleteMonitoringJob(`${id}`);
                  trackUsage('Sidebar.Monitoring.Delete', {
                    monitoringJob: monitoringJob.externalId,
                  });
                },
                icon: 'Delete',
              },
            ]}
            onClose={() => {
              setIsOpen(false);
            }}
          >
            <ActionButton
              size="small"
              icon="EllipsisVertical"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              style={{ marginLeft: '4px' }}
            />
          </Dropdown>
        </Col>
      </HeaderRow>
      <Row>
        <MonitoringJobTitle level={2} strong>
          {externalId}
        </MonitoringJobTitle>
      </Row>
      <ConditionRow>
        <JobCondition job={monitoringJob} />
      </ConditionRow>
      {showLastAlert && (
        <FooterRow>
          <Col span={17}>
            <CalendarIcon type="Calendar" />
            {t['Last alert:']}
            {!isFetchingAlerts ? lastAlertdate : <Icon type="Loader" />}
            {!isFetchingAlerts && fetchedAlerts
              ? lastAlertdate === undefined && t.None
              : null}
          </Col>

          {alerts?.length ? (
            <Col span={7}>
              <ShowAllButton onClick={handleClickAlerts}>
                {t.History}
                <Icon type="ArrowRight" size={10} />
              </ShowAllButton>
            </Col>
          ) : null}
        </FooterRow>
      )}
    </MonitoringJobPreview>
  );
};

export const CalendarIcon = styled(Icon)`
  position: relative;
  top: 3px;
  margin-right: 5px;
`;

export const ShowAllButton = styled(Button)`
  &&& {
    width: 100%;
    background: var(--cogs-midblue-7);
    color: var(--cogs-midblue-2);
    padding: 0;
    padding: 12px 6px;
    height: 14px;
    font-size: 1em;
    i {
      margin-left: 5px;
    }
  }
`;

export const MonitoringJobTitle = styled(Body)`
  margin-top: 0.3em;
  text-overflow: ellipsis;
  width: 100%;
  overflow: hidden;
`;

export const MonitoringJobPreview = styled.div`
  border: 1px solid var(--cogs-greyscale-grey3);
  background: var(--cogs-greyscale-grey1);
  padding: 0.5em;
  border-radius: 8px;
  margin-top: 4px;
`;

export const HeaderRow = styled(Row)`
  font-size: 0.8em;
`;

export const ConditionRow = styled(Row)`
  font-size: 0.9em;
`;

export const FooterRow = styled(Row)`
  margin-top: 1em;
  font-size: 0.8em;

  & > i {
    margin-right: 0.5em;
  }
`;

export const TimeseriesIcon = styled(Icon)`
  position: relative;
  top: 3px;
  margin-right: 5px;
`;

export const ActionButton = styled(Button)`
  &&& {
    color: ${Colors['decorative--blue--600']};
    background-color: ${Colors['decorative--blue--100']};
  }
  i {
    width: 12px !important;
    height: 12px;
  }
`;

export const WrappedTimeseriesName = styled(Col)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default ListMonitoringJobPreview;
