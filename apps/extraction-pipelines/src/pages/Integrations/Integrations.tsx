import React, { FunctionComponent, useEffect, useState } from 'react';
import { FullPageLayout } from 'components/layout/FullPageLayout';
import { trackUsage } from 'utils/Metrics';
import {
  ERROR_NOT_GET_EXT_PIPE,
  EXTRACTION_PIPELINES,
  OVERVIEW,
} from 'utils/constants';
import { useIntegrations } from 'hooks/useIntegrations';
import NoIntegrations from 'components/error/NoIntegrations';
import { Button, Loader, Modal } from '@cognite/cogs.js';
import { ErrorFeedback } from 'components/error/ErrorFeedback';
import ExtractorDownloadsLink from 'components/links/ExtractorDownloadsLink';
import { MainFullWidthGrid } from 'styles/grid/StyledGrid';
import { useAppEnv } from 'hooks/useAppEnv';
import { LinkWrapper } from 'styles/StyledLinks';
import { ExtPipesBreadcrumbs } from 'components/navigation/breadcrumbs/ExtPipesBreadcrumbs';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { EXTPIPES_READS, EXTPIPES_WRITES } from 'model/AclAction';
import IntegrationsTable from 'components/table/IntegrationsTable';
import { integrationTableColumns } from 'components/table/IntegrationTableCol';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import styled from 'styled-components';
import { ids } from 'cogs-variables';
import { CreateIntegration } from 'pages/create/CreateIntegration';
import { StyledTooltip } from 'styles/StyledToolTip';

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/guides/interfaces/about_integrations.html';

const VerticalSpace = styled.div`
  height: 16px;
`;
const CreateExtpipeModal = (props: { visible: boolean; close: () => void }) => {
  return (
    <Modal
      visible={props.visible}
      width={600}
      closable
      onCancel={props.close}
      appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
      getContainer={() =>
        document.getElementsByClassName(ids.styleScope).item(0) as any
      }
      footer={null}
      title="Create extraction pipeline"
    >
      <VerticalSpace />
      <CreateIntegration
        showAdditionalFields={false}
        customCancelCallback={props.close}
      />
    </Modal>
  );
};

interface OwnProps {}
type Props = OwnProps;

const Integrations: FunctionComponent<Props> = () => {
  const { project } = useAppEnv();
  useEffect(() => {
    trackUsage(OVERVIEW, { tenant: project });
  }, [project]);
  const {
    data: integrations,
    isLoading,
    error: errorIntegrations,
    refetch,
  } = useIntegrations();
  const permissions = useOneOfPermissions(EXTPIPES_WRITES);
  const canEdit = permissions.data;
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const createExtpipeButton = (
    <StyledTooltip
      disabled={canEdit}
      content="You have insufficient access rights to create an extraction pipeline."
    >
      <Button
        variant="default"
        type="primary"
        icon="PlusCompact"
        disabled={!canEdit}
        onClick={() => {
          setCreateModalOpen(canEdit);
        }}
      >
        Create extraction pipeline
      </Button>
    </StyledTooltip>
  );

  if (integrations && integrations.length === 0) {
    return (
      <>
        <CreateExtpipeModal
          visible={createModalOpen}
          close={() => setCreateModalOpen(false)}
        />
        <NoIntegrations actionButton={createExtpipeButton} />
      </>
    );
  }
  if (isLoading) {
    return <Loader />;
  }
  const handleErrorDialogClick = async () => {
    await refetch();
  };

  if (errorIntegrations) {
    return (
      <MainFullWidthGrid>
        <ErrorFeedback
          btnText="Retry"
          onClick={handleErrorDialogClick}
          fallbackTitle={ERROR_NOT_GET_EXT_PIPE}
          contentText="Please try again later."
          error={errorIntegrations}
        />
      </MainFullWidthGrid>
    );
  }

  return (
    <>
      <CreateExtpipeModal
        visible={createModalOpen}
        close={() => setCreateModalOpen(false)}
      />
      <IntegrationsTable
        columns={integrationTableColumns}
        tableActionButtons={createExtpipeButton}
        integrations={integrations!}
      />
    </>
  );
};

export default function CombinedComponent() {
  return (
    <FullPageLayout
      pageHeadingText={EXTRACTION_PIPELINES}
      headingSide={
        <LinkWrapper>
          <ExtractorDownloadsLink
            linkText="Download Extractors"
            link={{ path: '/extractors' }}
          />
          <ExtractorDownloadsLink
            linkText="Learning and resources"
            link={{ url: LEARNING_AND_RESOURCES_URL }}
          />
        </LinkWrapper>
      }
      breadcrumbs={<ExtPipesBreadcrumbs />}
      hideDividerLine
    >
      <CapabilityCheck requiredPermissions={EXTPIPES_READS}>
        <Integrations />
      </CapabilityCheck>
    </FullPageLayout>
  );
}
