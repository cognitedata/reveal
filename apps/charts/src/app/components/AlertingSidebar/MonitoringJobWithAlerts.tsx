import React, { useState } from 'react';

import { useAlertsResolveCreate } from '@charts-app/components/MonitoringAlert/hooks';
import { MonitoringJob } from '@charts-app/components/MonitoringSidebar/types';
import { useAddRemoveTimeseries } from '@charts-app/components/Search/hooks';
import { useChartAtom } from '@charts-app/models/chart/atom';
import { trackUsage } from '@charts-app/services/metrics';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { head } from 'lodash';

import { Col, Icon, Menu, Modal, Row, Chip } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';

import {
  TimeseriesContainer,
  DropdownMenuItem,
  ModalBody,
  DropdownActionAlerts,
} from './elements';
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

  const handleAddSourceToChart = () => {
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
            <DropdownActionAlerts
              visible={isMenuOpen}
              onClickOutside={onCloseDropdown}
              content={
                <div>
                  <Menu onClick={onCloseDropdown} style={{ width: '15rem' }}>
                    {!chartHasTimeseries && (
                      <DropdownMenuItem
                        key="mt-row-action-add-source"
                        onClick={handleAddSourceToChart}
                      >
                        <Icon type="Plus" />
                        {t['Add source to chart']}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      key="mt-row-action-mark-all-resolved"
                      onClick={() => setIsConfirmModalOpen(true)}
                    >
                      <Icon type="CheckmarkAlternative" />
                      {t['Mark all alerts as resolved']}
                    </DropdownMenuItem>
                  </Menu>
                </div>
              }
            >
              <Chip
                icon="EllipsisVertical"
                type="neutral"
                size="small"
                onClick={() => {
                  if (isMenuOpen) {
                    onCloseDropdown();
                  } else {
                    onOpenDropdown();
                  }
                }}
              />
            </DropdownActionAlerts>
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
