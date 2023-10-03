import React, { useState } from 'react';

import { head } from 'lodash';

import { Col, Icon, Menu, Modal, Row, Dropdown } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

import { useChartAtom } from '../../models/chart/atom';
import { trackUsage } from '../../services/metrics';
import { makeDefaultTranslations } from '../../utils/translations';
import { useAlertsResolveCreate } from '../MonitoringAlert/hooks';
import { ActionButton } from '../MonitoringSidebar/ListMonitoringJobPreview';
import { MonitoringJob } from '../MonitoringSidebar/types';
import { useAddRemoveTimeseries } from '../Search/hooks';

import { TimeseriesContainer, ModalBody } from './elements';
import { useListAlerts } from './hooks';

const defaultTranslations = makeDefaultTranslations(
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
};
const MonitoringJobWithAlerts = ({ job, translations }: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  const [chart] = useChartAtom();
  const timeseries = (chart && chart?.timeSeriesCollection) || [];
  const { data: alerts } = useListAlerts(`${job.id}`);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { mutate: resolveAlerts } = useAlertsResolveCreate(`${job.id}`);

  const onCloseDropdown = () => setIsMenuOpen(false);
  const onOpenDropdown = () => {
    setIsMenuOpen(true);
  };

  const onCloseModal = () => setIsConfirmModalOpen(false);
  const addTimeseries = useAddRemoveTimeseries();

  const handleMarkAllAlertsResolved = () => {
    resolveAlerts({
      items:
        alerts?.map((item) => ({
          id: item.id,
        })) || [],
    });
    onCloseModal();
    trackUsage('Sidebar.Alerting.MarkAllResolved', {
      monitoringJob: job.externalId,
    });
  };

  const { data: timeseriesDef } = useCdfItems<Timeseries>(
    'timeseries',
    [{ id: job.model.timeseriesId }],
    false
  );

  const handleAddSourceToChart = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (timeseriesDef) {
      addTimeseries(timeseriesDef[0]);
      trackUsage('Sidebar.Alerting.AddSource', {
        source: timeseriesDef?.[0]?.externalId,
      });
    }
  };

  const chartHasTimeseries = Boolean(
    timeseriesDef &&
      timeseries.find((ts) => {
        return ts.tsExternalId === timeseriesDef[0].externalId;
      })
  );

  return (
    <>
      <ConfirmModalResolveAlerts
        isConfirmModalOpen={isConfirmModalOpen}
        onCloseModal={onCloseModal}
        translations={translations}
        onMarkAllAlertsResolved={handleMarkAllAlertsResolved}
      />
      <TimeseriesContainer>
        <Row>
          <Col span={21}>
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              <Icon type="Timeseries" />
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {head(timeseriesDef)?.externalId}
              </span>
            </div>
          </Col>
          <Col span={3}>
            <Dropdown
              visible={isMenuOpen}
              onClickOutside={onCloseDropdown}
              content={
                <div>
                  <Menu onClick={onCloseDropdown} style={{ width: '15rem' }}>
                    {!chartHasTimeseries && (
                      <Menu.Item
                        key="mt-row-action-add-source"
                        onClick={handleAddSourceToChart}
                        icon="Plus"
                        iconPlacement="left"
                      >
                        {t['Add source to chart']}
                      </Menu.Item>
                    )}
                    <Menu.Item
                      key="mt-row-action-mark-all-resolved"
                      onClick={(event) => {
                        event.stopPropagation();
                        setIsConfirmModalOpen(true);
                      }}
                      icon="CheckmarkAlternative"
                      iconPlacement="left"
                    >
                      {t['Mark all alerts as resolved']}
                    </Menu.Item>
                  </Menu>
                </div>
              }
            >
              <ActionButton
                icon="EllipsisVertical"
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  if (isMenuOpen) {
                    onCloseDropdown();
                  } else {
                    onOpenDropdown();
                  }
                }}
              />
            </Dropdown>
          </Col>
        </Row>
      </TimeseriesContainer>
    </>
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
      visible={isConfirmModalOpen}
      okText="Yes, I understand"
      onOk={onMarkAllAlertsResolved}
      onCancel={onCloseModal}
      size="large"
      title={t['Are you sure you want to mark all as resolved ?']}
    >
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
