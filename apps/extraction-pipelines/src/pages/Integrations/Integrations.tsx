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
import IntegrationsTable from 'components/integrations/IntegrationsTable';
import ExtractorDownloadsLink from 'components/links/ExtractorDownloadsLink';
import { MainFullWidthGrid } from 'styles/grid/StyledGrid';
import { useAppEnv } from 'hooks/useAppEnv';
import { Integration } from 'model/Integration';
import { LinkWrapper } from 'styles/StyledLinks';
import { ExtPipesBreadcrumbs } from 'components/navigation/breadcrumbs/ExtPipesBreadcrumbs';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { EXTPIPES_READS } from 'model/AclAction';
import { CreateIntegration } from 'pages/create/CreateIntegration';
import { ids } from 'cogs-variables';

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/';

interface OwnProps {}

type Props = OwnProps;

const Integrations: FunctionComponent<Props> = () => {
  const { project } = useAppEnv();
  useEffect(() => {
    trackUsage(OVERVIEW, { tenant: project });
  }, [project]);
  const {
    data,
    isLoading,
    error: errorIntegrations,
    refetch,
  } = useIntegrations();
  if (data && data.length === 0) {
    return (
      <MainFullWidthGrid>
        <NoIntegrations />
      </MainFullWidthGrid>
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

  return <IntegrationsTable tableData={data as Integration[]} />;
};

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
      <CreateIntegration
        showAdditionalFields={false}
        customCancelCallback={props.close}
      />
    </Modal>
  );
};

export default function CombinedComponent() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  return (
    <>
      <CreateExtpipeModal
        visible={createModalOpen}
        close={() => setCreateModalOpen(false)}
      />
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
            <Button
              variant="default"
              type="primary"
              onClick={() => {
                setCreateModalOpen(true);
              }}
            >
              Create extraction pipeline
            </Button>
          </LinkWrapper>
        }
        breadcrumbs={<ExtPipesBreadcrumbs />}
      >
        <CapabilityCheck requiredPermissions={EXTPIPES_READS}>
          <Integrations />
        </CapabilityCheck>
      </FullPageLayout>
    </>
  );
}
