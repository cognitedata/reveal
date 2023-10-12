import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Button, Flex, Heading, Loader, Modal, Tabs } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { useTranslation } from '../../common';
import { CreateSourceModal } from '../../components/create-source-modal/CreateSourceModal';
import { ErrorComponent } from '../../components/error';
import NoExtpipes from '../../components/error/NoExtpipes';
import { StyledTooltip, PageWrapperColumn } from '../../components/styled';
import ExtpipesTable from '../../components/table/ExtpipesTable';
import ExtpipesTableSearch from '../../components/table/ExtpipesTableSearch';
import HostedExtractionPipelineTable from '../../components/table/HostedExtractionPipelineTable';
import { trackUsage } from '../../utils/Metrics';
import { getContainer } from '../../utils/utils';
import { CreateExtpipe } from '../create/CreateExtpipe';

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/guides/interfaces/about_integrations.html';

const CreateExtpipeModal = (props: {
  title: string;
  visible: boolean;
  close: () => void;
}) => {
  return (
    <Modal
      visible={props.visible}
      size="large"
      closable
      onCancel={props.close}
      getContainer={getContainer}
      hideFooter
      title={props.title}
    >
      <VerticalSpace />
      <CreateExtpipe customCancelCallback={props.close} />
    </Modal>
  );
};

const Extpipes: FunctionComponent = () => {
  const { t } = useTranslation();
  const { flow } = getFlow();
  useEffect(() => {
    trackUsage({ t: 'Overview' });
  }, []);

  const { data: hasExtractionPipelinesCreateCapability } = usePermissions(
    flow as any,
    'extractionPipelinesAcl',
    'WRITE'
  );

  const { data: hasHostedExtractionPipelinesCreateCapability } = usePermissions(
    flow as any,
    'hostedExtractorsAcl',
    'WRITE'
  );

  const { isEnabled: shouldShowHostedExtractors } = useFlag(
    'FUSION_HOSTED_EXTRACTORS',
    { forceRerender: true }
  );

  const [isCreateSourceModalOpen, setIsCreateSourceModalOpen] = useState(false);
  const [isCreateExtpipeModalOpen, setIsCreateExtPipeModalOpen] =
    useState(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');

  const tabKeys = useMemo(() => {
    const keys = ['self-hosted'];

    if (shouldShowHostedExtractors) {
      keys.push('hosted');
    }
    return keys;
  }, [shouldShowHostedExtractors]);

  const tab = searchParams.get('tab') ?? 'self-hosted';

  const hasCreateCapability = useMemo(() => {
    if (tab === 'hosted') {
      return hasHostedExtractionPipelinesCreateCapability;
    } else {
      return hasExtractionPipelinesCreateCapability;
    }
  }, [
    hasHostedExtractionPipelinesCreateCapability,
    hasExtractionPipelinesCreateCapability,
    tab,
  ]);

  const onClickCreateButton = useCallback(() => {
    if (tab === 'hosted' && !isCreateSourceModalOpen) {
      setIsCreateSourceModalOpen(true);
    } else if (tab === 'self-hosted' && !isCreateExtpipeModalOpen) {
      trackUsage({ t: 'Create.DialogOpened' });
      setIsCreateExtPipeModalOpen(true);
    }
  }, [tab, isCreateExtpipeModalOpen, isCreateSourceModalOpen]);

  const closeCreateDialog = useCallback(() => {
    trackUsage({ t: 'Create.DialogClosed' });
    if (isCreateSourceModalOpen) {
      setIsCreateSourceModalOpen(false);
    } else if (isCreateExtpipeModalOpen) {
      setIsCreateExtPipeModalOpen(false);
    }
  }, [isCreateExtpipeModalOpen, isCreateSourceModalOpen]);

  const CreateExtPipeButton = useMemo(() => {
    return (
      <StyledTooltip
        disabled={hasCreateCapability}
        content={t('no-create-access', { context: tab })}
      >
        <Button
          type="primary"
          icon="AddLarge"
          disabled={!hasCreateCapability}
          onClick={onClickCreateButton}
        >
          {t('create-ext-pipeline', { context: tab })}
        </Button>
      </StyledTooltip>
    );
  }, [onClickCreateButton, hasCreateCapability, tab, t]);

  const EmptyPage = useMemo(() => {
    return (
      <NoExtpipes
        actionButton={CreateExtPipeButton}
        isHostedExtractors={tab === 'hosted'}
      />
    );
  }, [tab, CreateExtPipeButton]);

  const HeaderCmp = useMemo(() => {
    return (
      <StyledActionBar>
        <ExtpipesTableSearch onChange={setSearchQuery} value={searchQuery} />
        {CreateExtPipeButton}
      </StyledActionBar>
    );
  }, [searchQuery, CreateExtPipeButton]);

  const tabs = useMemo(() => {
    return tabKeys.map((tabKey: string) => (
      <Tabs.Tab tabKey={tabKey} label={t('extractors', { context: tabKey })} />
    ));
  }, [tabKeys, t]);

  return (
    <StyledContainer>
      <CreateExtpipeModal
        visible={isCreateExtpipeModalOpen}
        close={closeCreateDialog}
        title={t('create-ext-pipeline')}
      />
      <CreateSourceModal
        onCancel={() => {
          setIsCreateSourceModalOpen(false);
        }}
        visible={isCreateSourceModalOpen}
      />
      <Flex direction="column" gap={16}>
        {tabs.length > 1 && (
          <Tabs
            activeKey={tab}
            onTabClick={(key) => {
              setSearchParams(
                (prev) => {
                  prev.set('tab', key);
                  return prev;
                },
                { replace: true }
              );
            }}
          >
            {tabs}
          </Tabs>
        )}
      </Flex>
      {tab === 'hosted' ? (
        <HostedExtractionPipelineTable
          search={searchQuery}
          emptyPage={EmptyPage}
          headerComp={HeaderCmp}
        />
      ) : (
        <ExtpipesTable
          search={searchQuery}
          emptyPage={EmptyPage}
          headerComp={HeaderCmp}
        />
      )}
    </StyledContainer>
  );
};

const StyledContainer = styled.div`
  margin-top: 24px;
  width: 100%;
`;

const StyledActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export default function CombinedComponent() {
  const { t } = useTranslation();
  const { flow } = getFlow();
  const {
    data: hasExtractionPipelinesCapability,
    isInitialLoading: loadingExtractionPipelinesPermission,
    refetch: refetchExtractionPipelinesPermission,
  } = usePermissions(flow as any, 'extractionPipelinesAcl', 'READ');
  const {
    isInitialLoading: loadingExtractionRunsPermission,
    data: hasExtractionRunsCapability,
    refetch: refetchExtractionRunsPermission,
  } = usePermissions(flow as any, 'extractionRunsAcl', 'READ');

  const refetch = useCallback(() => {
    (async () => {
      await refetchExtractionRunsPermission();
      await refetchExtractionPipelinesPermission();
    })();
  }, [refetchExtractionRunsPermission, refetchExtractionPipelinesPermission]);

  if (loadingExtractionRunsPermission || loadingExtractionPipelinesPermission) {
    return <Loader />;
  }

  return (
    <StyledPageContainer>
      <PageWrapperColumn>
        <Heading level={3}>{t('extraction-pipeline', { count: 0 })}</Heading>
        <Flex>
          {!hasExtractionPipelinesCapability || !hasExtractionRunsCapability ? (
            <ErrorComponent
              error={{ status: 403 }}
              handleErrorDialogClick={() => refetch}
            />
          ) : (
            <Extpipes />
          )}
        </Flex>
      </PageWrapperColumn>
    </StyledPageContainer>
  );
}

const VerticalSpace = styled.div`
  height: 16px;
`;

const StyledPageContainer = styled.div`
  padding: 0 16px;
`;
