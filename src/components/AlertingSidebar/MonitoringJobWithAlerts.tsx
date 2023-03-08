import { Col, Icon, Menu, Modal, Row, Title } from '@cognite/cogs.js';

import { LoadingRow } from 'components/Common/SidebarElements';
import { MonitoringJob } from 'components/MonitoringSidebar/types';
import React, { useState } from 'react';
import { makeDefaultTranslations } from 'utils/translations';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { head } from 'lodash';
import MonitoringAlertRow from 'components/MonitoringAlert/MonitoringAlert';
import {
  MONITORING_SIDEBAR_NAV_FROM_ALERT_SIDEBAR,
  MONITORING_SIDEBAR_HIGHLIGHTED_JOB,
  // MONITORING_SIDEBAR_KEY,
  MONITORING_SIDEBAR_SHOW_ALERTS,
} from 'utils/constants';
import { useSearchParam } from 'hooks/navigation';
import { useAddRemoveTimeseries } from 'components/Search/hooks';
import { customFormatDuration } from 'utils/date';
import { useAlertsResolveCreate } from 'components/MonitoringAlert/hooks';
import { useChartAtom } from 'models/chart/atom';
import {
  AlertContainer,
  JobContainer,
  ConditionContainer,
  TimeseriesContainer,
  DividerLine,
  DropdownMenuItem,
  ModalBody,
  MonitoringSidebarBlueButton,
  MonitoringSidebarEllipsis,
  DropdownActionAlerts,
} from './elements';
import { useListAlerts } from './hooks';

const defaultTranslations = makeDefaultTranslations(
  'Show all',
  'Add source to chart',
  'Mark all alerts as resolved',
  'Delete',
  'Condition',
  'Are you sure you want to mark all as resolved ?',
  'You have alerts in your monitoring job. You cannot undo this action and it will affect all subscribers.'
);

type Props = {
  job: MonitoringJob;
  translations?: typeof defaultTranslations;
  onViewMonitoringJobs: () => void;
};
const MonitoringJobWithAlerts = ({
  job,
  translations,
  onViewMonitoringJobs,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  const [chart] = useChartAtom();
  const timeseries = (chart && chart?.timeSeriesCollection) || [];
  const { data: alerts, isFetching } = useListAlerts(`${job.id}`);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [, setMonitoringShowAlerts] = useSearchParam(
    MONITORING_SIDEBAR_SHOW_ALERTS
  );
  const [, setMonitoringJobIdParam] = useSearchParam(
    MONITORING_SIDEBAR_HIGHLIGHTED_JOB
  );
  const [, setNavFromAlerts] = useSearchParam(
    MONITORING_SIDEBAR_NAV_FROM_ALERT_SIDEBAR
  );

  const { mutate: resolveAlerts } = useAlertsResolveCreate(`${job.id}`);

  const onCloseDropdown = () => setIsMenuOpen(false);
  const onOpenDropdown = () => setIsMenuOpen(true);

  const onMarkAsResolved = () => setIsConfirmModalOpen(true);
  const onCloseModal = () => setIsConfirmModalOpen(false);
  const addTimeseries = useAddRemoveTimeseries();
  const onMarkAllAlertsResolved = () => {
    resolveAlerts({
      items:
        alerts?.map((item) => ({
          id: item.id,
        })) || [],
    });
    onCloseModal();
  };

  const { data: timeseriesDef } = useCdfItems<Timeseries>(
    'timeseries',
    [{ id: job.model.timeseriesId }],
    false
  );

  const onClickShowAll = () => {
    setMonitoringShowAlerts('true');
    setMonitoringJobIdParam(`${job.id}`);
    setNavFromAlerts('true');
    onViewMonitoringJobs();
  };

  const onAddSourceToChart = () => {
    if (timeseriesDef) {
      addTimeseries(timeseriesDef[0]);
    }
  };

  const alertFor = customFormatDuration({ start: 0, end: job.interval });

  const chartHasTimeseries = Boolean(
    timeseriesDef &&
      timeseries.find((ts) => {
        return ts.tsExternalId === timeseriesDef[0].externalId;
      })
  );

  return (
    <JobContainer>
      <ConfirmModalResolveAlerts
        isConfirmModalOpen={isConfirmModalOpen}
        onCloseModal={onCloseModal}
        translations={translations}
        onMarkAllAlertsResolved={onMarkAllAlertsResolved}
      />
      <ConditionContainer key={job.id}>
        {t.Condition} :
        {`[is ${job.model.externalId.includes('lower') ? '<' : '>'} ${
          job.model.granularity
        }]`}
        {`[for > ${alertFor}]`}
      </ConditionContainer>
      <TimeseriesContainer>
        <Row>
          <Col span={22}>
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              <Icon type="Timeseries" />
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {head(timeseriesDef)?.externalId}
              </span>
            </div>
          </Col>
          <Col span={2}>
            <DropdownActionAlerts
              visible={isMenuOpen}
              onClickOutside={onCloseDropdown}
              content={
                <div>
                  <Menu onClick={onCloseDropdown} style={{ width: '15rem' }}>
                    {!chartHasTimeseries && (
                      <DropdownMenuItem
                        key="mt-row-action-add-source"
                        onClick={onAddSourceToChart}
                      >
                        <Icon type="Plus" />
                        {t['Add source to chart']}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      key="mt-row-action-mark-all-resolved"
                      onClick={onMarkAsResolved}
                    >
                      <Icon type="CheckmarkAlternative" />
                      {t['Mark all alerts as resolved']}
                    </DropdownMenuItem>
                  </Menu>
                </div>
              }
            >
              <MonitoringSidebarEllipsis
                type="EllipsisVertical"
                onClick={onOpenDropdown}
              />
            </DropdownActionAlerts>
          </Col>
        </Row>
      </TimeseriesContainer>
      <DividerLine />
      {isFetching ? (
        <LoadingRow lines={4} />
      ) : (
        alerts?.slice(0, 5).map((alert) => {
          return (
            <AlertContainer key={alert.id}>
              <MonitoringAlertRow alert={alert} jobId={`${job.id}`} />
            </AlertContainer>
          );
        })
      )}
      <MonitoringSidebarBlueButton onClick={() => onClickShowAll()}>
        {t['Show all']}
        <Icon type="ArrowRight" size={12} />
      </MonitoringSidebarBlueButton>
    </JobContainer>
  );
};

type ModalProps = {
  isConfirmModalOpen: boolean;
  onCloseModal: () => void;
  translations?: typeof defaultTranslations;
  onMarkAllAlertsResolved: () => void;
};
const ConfirmModalResolveAlerts = ({
  isConfirmModalOpen,
  onCloseModal,
  translations,
  onMarkAllAlertsResolved,
}: ModalProps) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  return (
    <Modal
      appElement={document.getElementsByTagName('body')}
      visible={isConfirmModalOpen}
      okText="Yes, I understand"
      onOk={onMarkAllAlertsResolved}
      onCancel={onCloseModal}
      width={750}
    >
      <Title level={4}>
        {t['Are you sure you want to mark all as resolved ?']}
      </Title>
      <ModalBody>
        {
          t[
            'You have alerts in your monitoring job. You cannot undo this action and it will affect all subscribers.'
          ]
        }
      </ModalBody>
    </Modal>
  );
};

export default MonitoringJobWithAlerts;
