import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import Dropdown from '@charts-app/components/Dropdown/Dropdown';
import { useSearchParam } from '@charts-app/hooks/navigation';
import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import { trackUsage } from '@charts-app/services/metrics';
import {
  MONITORING_SIDEBAR_HIGHLIGHTED_JOB,
  MONITORING_SIDEBAR_SHOW_ALERTS,
} from '@charts-app/utils/constants';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { Col, Row } from 'antd';
import { format } from 'date-fns';
import { head } from 'lodash';
import { nanoid } from 'nanoid';

import { Button, Icon, toast, Body } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

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
import { validateEmail } from './utils';

const defaultTranslations = makeDefaultTranslations(
  'Delete',
  'Unable to delete monitoring job',
  'Monitoring Job deleted succesfully',
  'Unable to subscribe',
  'Unable to unsubscribe',
  'History',
  'Last alert:',
  'None',
  'Email not found',
  'User ID not found'
);

type Props = {
  translations?: typeof defaultTranslations;
  monitoringJob: MonitoringJob;
  timeseriesName?: string;
  showHighlightedBorder?: boolean;
  showLastAlert?: boolean;
  trackingInfo?: { filter?: string; folderName?: string };
};
const ListMonitoringJobPreview = ({
  monitoringJob,
  timeseriesName,
  translations,
  showHighlightedBorder = true,
  showLastAlert = true,
  trackingInfo,
}: Props) => {
  const { data: timeseriesDef } = useCdfItems<Timeseries>(
    'timeseries',
    [{ id: monitoringJob.model.timeseriesId }],
    false,
    { enabled: timeseriesName === undefined }
  );

  const [monitoringJobIdParam, setMonitoringJobIdParam] = useSearchParam(
    MONITORING_SIDEBAR_HIGHLIGHTED_JOB
  );

  const t = {
    ...defaultTranslations,
    ...translations,
  };

  const userInfo = useUserInfo();
  const userAuthId = userInfo.data?.id;

  let notificationEmail =
    userInfo.data?.mail && validateEmail(userInfo.data.mail)
      ? userInfo.data?.mail
      : null;
  if (notificationEmail === null) {
    // some users have an email as their displayName or givenName
    if (
      userInfo.data?.displayName &&
      validateEmail(userInfo.data.displayName)
    ) {
      notificationEmail = userInfo.data.displayName;
    }
    if (userInfo.data?.givenName && validateEmail(userInfo.data.givenName)) {
      notificationEmail = userInfo.data.givenName;
    }
  }

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
      userAuthId || ''
    );

  useEffect(() => {
    if (deleteMonitoringJobError) {
      toast.error(t['Unable to delete monitoring job']);
    }
    if (deleteMonitoringJobSuccess) {
      toast.success(t['Monitoring Job deleted succesfully']);
    }
  }, [
    deleteMonitoringJobError,
    deleteMonitoringJobErrorMsg,
    deleteMonitoringJobSuccess,
  ]);

  const isSubscribed =
    false || (subscriptionResponse && subscriptionResponse[monitoringJob.id]);

  const name = timeseriesName || (timeseriesDef && head(timeseriesDef)?.name);
  const { id, externalId } = monitoringJob;

  const handleSubscribe = () => {
    if (!notificationEmail) {
      toast.error(t['Email not found']);
    } else if (!userAuthId) {
      toast.error(t['User ID not found']);
    } else {
      createSubscription({
        channelID: monitoringJob.channelId,
        userAuthId: userAuthId || '',
        userEmail: notificationEmail,
        subscriptionExternalId: nanoid(15),
      });
      trackUsage('Sidebar.Monitoring.Subscribe', {
        monitoringJob: externalId,
        folder: trackingInfo?.folderName,
        filter: trackingInfo?.filter,
      });
    }
  };

  const handleUnsubscribe = () => {
    if (!notificationEmail) {
      toast.error(t['Email not found']);
    } else if (!userAuthId) {
      toast.error(t['User ID not found']);
    } else {
      deleteSubscription({
        userAuthId: userAuthId || '',
        channelID: monitoringJob.channelId,
        userEmail: notificationEmail || '',
      });
      trackUsage('Sidebar.Monitoring.Unsubscribe', {
        monitoringJob: externalId,
        folder: trackingInfo?.folderName,
        filter: trackingInfo?.filter,
      });
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [, setShowAlerts] = useSearchParam(MONITORING_SIDEBAR_SHOW_ALERTS);
  const isHighlighted =
    showHighlightedBorder && Number(monitoringJobIdParam || 0) === id;
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
      style={
        isHighlighted
          ? { border: '1px solid var(--cogs-text-icon--interactive--default)' }
          : {}
      }
    >
      <HeaderRow>
        <WrappedTimeseriesName span={19}>
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
            <>
              {isSubscribed ? (
                <ActionIcon type="BellFilled" onClick={handleUnsubscribe} />
              ) : (
                <ActionIcon type="Bell" onClick={handleSubscribe} />
              )}
            </>
          )}
        </Col>
        <Col span={2}>
          <Dropdown
            open={isOpen}
            options={[
              {
                label: 'Delete',
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
            <ActionIcon
              type="EllipsisVertical"
              onClick={() => setIsOpen(true)}
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

export const ActionIcon = styled(Icon)`
  &&& {
    position: relative;
    top: 3px;
    cursor: pointer;
    background: var(--cogs-midblue-7);
    color: var(--cogs-midblue-2);
    display: inline-block;
    width: 22px !important;
    height: 22px;
    padding: 5px;
    border-radius: 5px;
  }
`;

export const WrappedTimeseriesName = styled(Col)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default ListMonitoringJobPreview;
