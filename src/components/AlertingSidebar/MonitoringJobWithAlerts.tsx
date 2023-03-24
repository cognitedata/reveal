import { Col, Icon, Menu, Modal, Row, Title } from '@cognite/cogs.js';

import { MonitoringJob } from 'components/MonitoringSidebar/types';
import React, { useState } from 'react';
import { makeDefaultTranslations } from 'utils/translations';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { head } from 'lodash';

import { useAddRemoveTimeseries } from 'components/Search/hooks';
import { useAlertsResolveCreate } from 'components/MonitoringAlert/hooks';
import { useChartAtom } from 'models/chart/atom';
import { trackUsage } from 'services/metrics';
import {
  TimeseriesContainer,
  DropdownMenuItem,
  ModalBody,
  MonitoringSidebarEllipsis,
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
              <MonitoringSidebarEllipsis
                size={22}
                type="EllipsisVertical"
                onClick={(event) => {
                  event.stopPropagation(); // to not toggle alert when clicking menu
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
