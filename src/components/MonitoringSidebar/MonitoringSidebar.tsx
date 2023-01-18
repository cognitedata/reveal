import { memo, useState } from 'react';
import { Button, Icon, Tooltip } from '@cognite/cogs.js';

import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import {
  ContentContainer,
  ContentOverflowWrapper,
  Sidebar,
  SidebarHeaderActions,
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
} from 'components/Common/SidebarElements';
import CreateMonitoringJob from './CreateMonitoringJob';
// Commenting out temporarily since ListJobs is not part of this PR
// import ListMonitoringJobs from './ListMonitoringJobs';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const defaultTranslation = makeDefaultTranslations(
  'Monitoring',
  'Hide',
  'Create'
);

const MonitoringSidebar = memo(({ visible, onClose }: Props) => {
  const [showMonitoringJobForm, setShowMonitoringJobForm] = useState(false);
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'EventSidebar').t,
  };

  const onCancel = () => {
    setShowMonitoringJobForm(false);
  };

  return (
    <Sidebar visible={visible}>
      <TopContainer>
        <TopContainerTitle>
          <Icon size={21} type="Alarm" />
          {t.Monitoring}
        </TopContainerTitle>
        <TopContainerAside>
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
          <SidebarHeaderActions>
            {!showMonitoringJobForm && (
              <Button
                icon="Plus"
                type="primary"
                size="small"
                aria-label="Add monitoring task"
                onClick={() => {
                  setShowMonitoringJobForm(true);
                }}
              >
                {t.Create}
              </Button>
            )}
          </SidebarHeaderActions>
          {showMonitoringJobForm && (
            <CreateMonitoringJob
              onCancel={onCancel}
              onViewMonitoringJob={onCancel}
            />
          )}
          {!showMonitoringJobForm && (
            /* 
              Commenting out temporarily since ListJobs is not part of this PR
              <ListMonitoringJobs /> */
            <></>
          )}
        </ContentContainer>
      </ContentOverflowWrapper>
    </Sidebar>
  );
});

export default MonitoringSidebar;
