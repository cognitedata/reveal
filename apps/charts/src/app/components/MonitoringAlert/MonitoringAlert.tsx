import React, { useState } from 'react';

import styled from 'styled-components';

import { format, formatDistance } from 'date-fns';

import { Row, Col, Dropdown, Menu, Icon, Modal } from '@cognite/cogs.js';

import { trackUsage } from '../../services/metrics';
import { durationFormatter } from '../../utils/date';
import { makeDefaultTranslations } from '../../utils/translations';

import { AlertAction, AlertText, ModalBody } from './elements';
import { useAlertsResolveCreate } from './hooks';
import { AlertResponse } from './types';

const defaultTranslations = makeDefaultTranslations(
  'Change Status',
  'Mark as resolved',
  'Active',
  'Inactive',
  'Resolved',
  'Change status to resolved',
  'You want to change status of alert. You cannot undo this action and it will affect all subscribers.',
  'Yes, I understand'
);

type Props = {
  alert: AlertResponse;
  translations?: typeof defaultTranslations;
  jobId: string;
};
const MonitoringAlertRow = ({ alert, translations, jobId }: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  const { mutate: resolveAlert } = useAlertsResolveCreate(jobId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const onCloseDropdown = () => setIsMenuOpen(false);
  const onOpenDropdown = () => setIsMenuOpen(true);
  const date = format(new Date(Number(alert.startTime)), 'dd/MM/yyyy HH:mm');
  const duration =
    alert.startTime &&
    alert.lastTriggeredTime &&
    durationFormatter(
      `- ${formatDistance(
        new Date(alert.startTime),
        new Date(alert.lastTriggeredTime)
      )}`
    );

  return (
    <Row>
      <AlertText span={15}>
        {date} {duration}
      </AlertText>
      <Col span={9}>
        <ResolverContainer>
          {!alert.closed ? (
            <Dropdown
              visible={isMenuOpen}
              onClickOutside={onCloseDropdown}
              content={
                <div>
                  <Menu onClick={onCloseDropdown} style={{ width: '14rem' }}>
                    <Menu.Header>{t['Change Status']}</Menu.Header>

                    <Menu.Item
                      key="alert-row-inactive"
                      icon="CheckmarkAlternative"
                      iconPlacement="left"
                      onClick={() => {
                        setIsModalVisible(true);
                      }}
                    >
                      {t['Mark as resolved']}
                    </Menu.Item>
                  </Menu>
                </div>
              }
            >
              <AlertAction onClick={onOpenDropdown}>
                {t.Active}
                <Icon type="ChevronDownSmall" />
              </AlertAction>
            </Dropdown>
          ) : (
            <AlertAction resolved>{t.Resolved}</AlertAction>
          )}
        </ResolverContainer>
      </Col>

      <Modal
        title={t['Change status to resolved']}
        visible={isModalVisible}
        okText={t['Yes, I understand']}
        onOk={() => {
          resolveAlert({
            items: [
              {
                id: alert.id,
              },
            ],
          });
          setIsModalVisible(false);
          trackUsage('Sidebar.Alerting.ResolveAlert', {
            alert: alert.id,
            monitoringJob: jobId,
          });
        }}
        onCancel={() => {
          setIsModalVisible(false);
        }}
      >
        <ModalBody>
          {
            t[
              'You want to change status of alert. You cannot undo this action and it will affect all subscribers.'
            ]
          }
        </ModalBody>
      </Modal>
    </Row>
  );
};

const ResolverContainer = styled.div`
  text-align: right;
`;

export default MonitoringAlertRow;
