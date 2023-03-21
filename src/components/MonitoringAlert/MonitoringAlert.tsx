import React, { useState } from 'react';
import { Row, Col, Dropdown, Menu, Icon, Modal, Title } from '@cognite/cogs.js';
import { makeDefaultTranslations } from 'utils/translations';
import { format, formatDistance } from 'date-fns';
import styled from 'styled-components';
import { durationFormatter } from 'utils/date';
import { trackUsage } from 'services/metrics';
import { AlertResponse } from './types';
import { useAlertsResolveCreate } from './hooks';
import {
  AlertAction,
  AlertActionTitle,
  AlertText,
  ModalBody,
} from './elements';

const defaultTranslations = makeDefaultTranslations(
  'Change Status',
  'Mark as resolved',
  'Active',
  'Inactive',
  'Resolved',
  'Change status to resolved',
  'You want to change status of alert. You cannot undo this action and it will affect all subscribers.'
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
  const popperOptions = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, -110],
        },
      },
    ],
  };
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
              popperOptions={popperOptions}
              visible={isMenuOpen}
              onClickOutside={onCloseDropdown}
              content={
                <div>
                  <Menu onClick={onCloseDropdown} style={{ width: '14rem' }}>
                    <AlertActionTitle>{t['Change Status']}</AlertActionTitle>

                    <Menu.Item
                      key="alert-row-inactive"
                      onClick={() => {
                        setIsModalVisible(true);
                      }}
                    >
                      <Icon type="CheckmarkAlternative" />
                      {t['Mark as resolved']}
                    </Menu.Item>
                  </Menu>
                </div>
              }
            >
              <AlertAction onClick={onOpenDropdown}>
                {t.Active}
                <Icon type="ChevronDown" />
              </AlertAction>
            </Dropdown>
          ) : (
            <ResolvedText>{t.Resolved}</ResolvedText>
          )}
        </ResolverContainer>
      </Col>

      <Modal
        appElement={document.getElementsByTagName('body')}
        visible={isModalVisible}
        okText="Yes, I understand"
        onOk={() => {
          resolveAlert({
            items: [
              {
                id: alert.id,
              },
            ],
          });
          setIsModalVisible(false);
          trackUsage('Sidebar.Alerting.ResolveAlert', { alert: alert.id });
        }}
        onCancel={() => {
          setIsModalVisible(false);
        }}
        width={750}
      >
        <Title level={4}>{t['Change status to resolved']}</Title>
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

const ResolvedText = styled.div`
  position: relative;
  top: 8px;
  margin-right: 7px;
  letter-spacing: 0.1rem;
  margin-bottom: 1em;
`;

const ResolverContainer = styled.div`
  text-align: right;
`;

export default MonitoringAlertRow;
