import React, { FunctionComponent, useEffect, useState } from 'react';
import { FullPageLayout } from 'components/layout/FullPageLayout';
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
import { getExtpipeTableColumns } from 'components/table/ExtpipeTableCol';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import styled from 'styled-components';
import { getContainer } from 'utils/utils';
import { styleScope } from 'styles/styleScope';
import { CreateExtpipe } from 'pages/create/CreateExtpipe';

import { trackUsage } from 'utils/Metrics';
import { getProject } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';

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
      width={600}
      closable
      onCancel={props.close}
      appElement={document.getElementsByClassName(styleScope).item(0)!}
      getContainer={getContainer}
      footer={null}
      title={props.title}
    >
      <VerticalSpace />
      <CreateExtpipe customCancelCallback={props.close} />
    </Modal>
  );
};

interface OwnProps {}

type Props = OwnProps;

const Extpipes: FunctionComponent<Props> = () => {
  const { t } = useTranslation();
  const project = getProject();
  const { extpipeTableColumns } = getExtpipeTableColumns(t);

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
    <StyledTooltip disabled={canEdit} content={t('no-create-access')}>
      <Button
        variant="default"
        type="primary"
        icon="AddLarge"
        disabled={!canEdit}
        onClick={onClickCreateButton}
      >
        {t('create-ext-pipeline')}
      </Button>
    </StyledTooltip>
  );

  if (extpipes && extpipes.length === 0) {
    return (
      <>
        <CreateExtpipeModal
          visible={createModalOpen}
          close={() => setCreateModalOpen(false)}
          title={t('create-ext-pipeline')}
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
          fallbackTitle={t('fail-to-get-ext-pipeline')}
          contentText={t('try-again-later')}
          error={errorExtpipes}
        />
      </MainFullWidthGrid>
    );
  }

  return (
    <>
      <CreateExtpipeModal
        visible={createModalOpen}
        close={closeCreateDialog}
        title={t('create-ext-pipeline')}
      />
      <ExtpipesTable
        columns={extpipeTableColumns}
        tableActionButtons={createExtpipeButton}
        extpipes={extpipes!}
      />
    </>
  );
};

export default function CombinedComponent() {
  const { t } = useTranslation();
  return (
    <FullPageLayout
      pageHeadingText={t('extraction-pipeline', { count: 0 })}
      headingSide={
        <LinkWrapper>
          <ExtractorDownloadsLink
            linkText={t('download-extractors')}
            link={{ path: '/extractors' }}
          />
          <ExtractorDownloadsLink
            linkText={t('learning-and-resources')}
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

const VerticalSpace = styled.div`
  height: 16px;
`;
