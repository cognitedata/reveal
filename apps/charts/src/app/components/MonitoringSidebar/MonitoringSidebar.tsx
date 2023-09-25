import { memo, useEffect, useState } from 'react';

import {
  ContentContainer,
  ContentOverflowWrapper,
  Sidebar,
  SidebarHeaderActions,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
} from '@charts-app/components/Common/SidebarElements';
import { useSearchParam } from '@charts-app/hooks/navigation';
import { useTranslations } from '@charts-app/hooks/translations';
import { startTimer, trackUsage } from '@charts-app/services/metrics';
import {
  MONITORING_SIDEBAR_HIGHLIGHTED_JOB,
  MONITORING_SIDEBAR_NAV_FROM_ALERT_SIDEBAR,
  MONITORING_SIDEBAR_SELECTED_FOLDER,
  MONITORING_SIDEBAR_SHOW_ALERTS,
  MONITORING_FILTER,
} from '@charts-app/utils/constants';
import { makeDefaultTranslations } from '@charts-app/utils/translations';

import { Button, Icon, Tooltip } from '@cognite/cogs.js';

import { TempPromoChip } from '../TempPromoChip/TempPromoChip';

import CreateMonitoringJob from './CreateMonitoringJob';
import ListMonitoringJobAlerts from './ListMonitoringJobAlerts';
import ListMonitoringJobs from './ListMonitoringJobs';
// Commenting out temporarily since ListJobs is not part of this PR
// import ListMonitoringJobs from './ListMonitoringJobs';

type Props = {
  onClose: () => void;
  onViewAlertingSidebar: () => void;
};

const defaultTranslation = makeDefaultTranslations(
  'Monitoring',
  'Hide',
  'Create',
  'Back',
  'Beta',
  'This feature is available for beta testing and will likely change. Use it for testing purposes only.'
);

export const MonitoringSidebar = memo(
  ({ onClose, onViewAlertingSidebar }: Props) => {
    const [showMonitoringJobForm, setShowMonitoringJobForm] = useState(false);
    const [, setShowAlerts] = useSearchParam(MONITORING_SIDEBAR_SHOW_ALERTS);
    const [, setMonitoringJobIdParam] = useSearchParam(
      MONITORING_SIDEBAR_HIGHLIGHTED_JOB
    );
    const [, setMonitoringFolder] = useSearchParam(
      MONITORING_SIDEBAR_SELECTED_FOLDER
    );

    const [navFromAlerts, setNavFromAlerts] = useSearchParam(
      MONITORING_SIDEBAR_NAV_FROM_ALERT_SIDEBAR
    );

    const [, setMonitoringFilter] = useSearchParam(MONITORING_FILTER);

    const t = {
      ...defaultTranslation,
      ...useTranslations(Object.keys(defaultTranslation), 'MonitoringSidebar')
        .t,
    };
    const [monitoringShowAlerts, setMonitoringShowAlerts] = useSearchParam(
      MONITORING_SIDEBAR_SHOW_ALERTS
    );

    const handleCancel = () => {
      setShowMonitoringJobForm(false);
    };

    useEffect(() => {
      return () => {
        setShowAlerts(undefined);
        setMonitoringJobIdParam(undefined);
        setMonitoringFolder(undefined);
        setMonitoringShowAlerts(undefined);
        setMonitoringFilter();
      };
    }, []);

    return (
      <Sidebar visible>
        <TopContainer>
          <TopContainerTitle>
            <Icon size={21} type="Alarm" />
            {t.Monitoring}
          </TopContainerTitle>
          <TopContainerAside>
            <TempPromoChip
              tooltip={
                t[
                  'This feature is available for beta testing and will likely change. Use it for testing purposes only.'
                ]
              }
            >
              {t['Beta']}
            </TempPromoChip>
            <Tooltip content={t.Hide}>
              <Button
                icon="Close"
                type="ghost"
                onClick={onClose}
                aria-label="Close"
              />
            </Tooltip>
          </TopContainerAside>
        </TopContainer>
        <ContentOverflowWrapper>
          <ContentContainer>
            {showMonitoringJobForm && (
              <CreateMonitoringJob onCancel={handleCancel} />
            )}
            {!showMonitoringJobForm && monitoringShowAlerts !== 'true' && (
              <>
                <SidebarHeaderActions>
                  {!showMonitoringJobForm && (
                    <Button
                      icon="Plus"
                      type="primary"
                      size="small"
                      aria-label="Add monitoring task"
                      onClick={() => {
                        setShowMonitoringJobForm(true);
                        trackUsage('Sidebar.Monitoring.CreateClicked');
                        startTimer('Sidebar.Monitoring.CreateJob');
                      }}
                    >
                      {t.Create}
                    </Button>
                  )}
                </SidebarHeaderActions>
                <ListMonitoringJobs />
              </>
            )}
            {monitoringShowAlerts === 'true' && (
              <>
                <SidebarHeaderActions>
                  <Button
                    icon="ChevronLeftSmall"
                    size="small"
                    aria-label="Back"
                    onClick={() => {
                      if (navFromAlerts === 'true') {
                        onViewAlertingSidebar();
                        setNavFromAlerts(undefined);
                      }
                      setShowAlerts(undefined);
                      setMonitoringJobIdParam(undefined);
                      trackUsage('Sidebar.Monitoring.AlertHistoryBack');
                    }}
                  >
                    {t.Back}
                  </Button>
                </SidebarHeaderActions>

                <ListMonitoringJobAlerts />
              </>
            )}
          </ContentContainer>
        </ContentOverflowWrapper>
      </Sidebar>
    );
  }
);
