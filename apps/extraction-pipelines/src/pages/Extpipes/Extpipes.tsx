import React, { FunctionComponent, useEffect, useState } from 'react';
import { FullPageLayout } from 'components/layout/FullPageLayout';
import { ERROR_NOT_GET_EXT_PIPE, EXTRACTION_PIPELINES } from 'utils/constants';
import { useExtpipes } from 'hooks/useExtpipes';
import NoExtpipes from 'components/error/NoExtpipes';
import { Button, Loader, Modal } from '@cognite/cogs.js';
import { ErrorFeedback } from 'components/error/ErrorFeedback';
import ExtractorDownloadsLink from 'components/links/ExtractorDownloadsLink';
import {
  MainFullWidthGrid,
  LinkWrapper,
  StyledTooltip,
} from 'components/styled';
import { ExtPipesBreadcrumbs } from 'components/navigation/breadcrumbs/ExtPipesBreadcrumbs';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { EXTPIPES_READS, EXTPIPES_WRITES } from 'model/AclAction';
import ExtpipesTable from 'components/table/ExtpipesTable';
import { extpipeTableColumns } from 'components/table/ExtpipeTableCol';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import styled from 'styled-components';
import { getContainer } from 'utils/utils';
import { styleScope } from 'styles/styleScope';
import { CreateExtpipe } from 'pages/create/CreateExtpipe';

import { trackUsage } from 'utils/Metrics';
import { getProject } from '@cognite/cdf-utilities';

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/guides/interfaces/about_integrations.html';

const VerticalSpace = styled.div`
  height: 16px;
`;
const CreateExtpipeModal = (props: { visible: boolean; close: () => void }) => {
  debugger;

  return (
    <Modal
      visible={props.visible}
      width={600}
      closable
      onCancel={props.close}
      appElement={document.getElementsByClassName(styleScope).item(0)!}
      getContainer={getContainer}
      footer={null}
      title="Create extraction pipeline"
    >
      <VerticalSpace />
      <CreateExtpipe customCancelCallback={props.close} />
    </Modal>
  );
};

interface OwnProps {}

type Props = OwnProps;

const Extpipes: FunctionComponent<Props> = () => {
  const project = getProject();
  useEffect(() => {
    trackUsage({ t: 'Overview', tenant: project! });
  }, [project]);
  const {
    data: extpipes,
    isLoading,
    error: errorExtpipes,
    refetch,
  } = useExtpipes();
  const permissions = useOneOfPermissions(EXTPIPES_WRITES);
  const canEdit = permissions.data;
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const onClickCreateButton = () => {
    if (canEdit && !createModalOpen) {
      trackUsage({ t: 'Create.DialogOpened' });
      setCreateModalOpen(true);
    }
  };
  const closeCreateDialog = () => {
    trackUsage({ t: 'Create.DialogClosed' });
    setCreateModalOpen(false);
  };

  const createExtpipeButton = (
    <StyledTooltip
      disabled={canEdit}
      content="You have insufficient access rights to create an extraction pipeline."
    >
      <Button
        variant="default"
        type="primary"
        icon="AddLarge"
        disabled={!canEdit}
        onClick={onClickCreateButton}
      >
        Create extraction pipeline
      </Button>
    </StyledTooltip>
  );

  if (extpipes && extpipes.length === 0) {
    return (
      <>
        <CreateExtpipeModal
          visible={createModalOpen}
          close={() => setCreateModalOpen(false)}
        />
        <NoExtpipes actionButton={createExtpipeButton} />
      </>
    );
  }
  if (isLoading) {
    return <Loader />;
  }
  const handleErrorDialogClick = async () => {
    await refetch();
  };

  if (errorExtpipes) {
    return (
      <MainFullWidthGrid>
        <ErrorFeedback
          btnText="Retry"
          onClick={handleErrorDialogClick}
          fallbackTitle={ERROR_NOT_GET_EXT_PIPE}
          contentText="Please try again later."
          error={errorExtpipes}
        />
      </MainFullWidthGrid>
    );
  }

  return (
    <>
      <CreateExtpipeModal visible={createModalOpen} close={closeCreateDialog} />
      <ExtpipesTable
        columns={extpipeTableColumns}
        tableActionButtons={createExtpipeButton}
        extpipes={extpipes!}
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
        <Extpipes />
      </CapabilityCheck>
    </FullPageLayout>
  );
}
