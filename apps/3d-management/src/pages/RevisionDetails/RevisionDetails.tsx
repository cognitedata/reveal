import styled from 'styled-components';
import { Card, message, Modal } from 'antd';
import { Tooltip, Button, Flex, Icon } from '@cognite/cogs.js';
import { RouteComponentProps } from 'react-router-dom';
import {
  isReprocessingRequired,
  APP_TITLE,
  getContainer,
  logToSentry,
  DEFAULT_MARGIN_V,
} from 'utils';
import { useMetrics } from 'hooks/useMetrics';
import React, { useEffect, useState } from 'react';

import { createLink } from '@cognite/cdf-utilities';
import dayjs from 'dayjs';
import Status from 'components/Status';
import NotFound from 'pages/NotFound';
import Spinner from 'components/Spinner';
import { PageHeader } from 'components/PageHeader';

import PermissioningHintWrapper from 'components/PermissioningHintWrapper';
import ErrorBoundary from 'components/ErrorBoundary';
import ThreeDViewerWrapper from 'pages/RevisionDetails/components/ThreeDViewerWrapper';

import { ReprocessingModal } from 'pages/RevisionDetails/components/ReprocessingModal';
import { RevisionLogs } from 'pages/RevisionDetails/components/RevisionLogs';
import {
  useRevisions,
  useRevisionLogs,
  useUpdateRevisionMutation,
  useDeleteRevisionMutation,
} from 'hooks/revisions';
import { useModels } from 'hooks/models/useModels';

import { Revision3D } from '@cognite/sdk';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { useFlag } from '@cognite/react-feature-flags';

export const PUBLISH_STATUS_HINT = `
  Publishing a Revision makes this version of
  the model accessible for users in other applications.
`;

const PageWithFixedWidth = styled.div<{ width: number }>`
  min-width: ${(props) => props.width}px;
  width: 100%;
`;

const ButtonRow = styled.div`
  display: flex;
  margin-top: 20px;

  .left-button {
    align-self: start;
    margin-right: 12px;
    margin-left: 0;
  }
  .right-button {
    align-self: end;
    margin-right: 0;
    margin-left: auto;
  }
`;

const ViewLogsButton = styled(Button)`
  margin-left: 12px;
  font-size: 12px;
  && > span {
    margin-left: 6px;
  }
`;

const DetailsRowFlex = styled(Flex)`
  margin: 4px 0;
  > *:first-child {
    width: 100%;
    flex-shrink: 0;
    min-width: 120px;
    max-width: 280px;
  }
`;

type ViewerType = 'Legacy' | 'Reveal' | 'Unknown';

type Props = RouteComponentProps<{
  modelId: string;
  revisionId: string;
}>;

export default function RevisionDetails(props: Props) {
  const metrics = useMetrics('3D.Revisions');

  const { flow } = getFlow();

  const {
    data: hasUpdateCapabilities,
    isFetched: isFetchedUpdateCapabilities,
  } = usePermissions(flow, 'threedAcl', 'UPDATE');
  const {
    data: hasDeleteCapabilities,
    isFetched: isFetchedDeleteCapabilities,
  } = usePermissions(flow, 'threedAcl', 'DELETE');

  const revisionId: number = Number(props.match.params.revisionId);
  const modelId: number = Number(props.match.params.modelId);

  const alwaysShowReprocessingButton = useFlag('3DM_show_reprocessing');

  const [showLogs, setShowLogs] = useState(false);
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [reprocessingRequired, setReprocessingRequired] = useState(false);
  const [reprocessingModalVisible, setReprocessingModalVisible] = useState(
    false
  );
  const [viewerType, setViewerType] = useState<ViewerType>('Unknown');

  const modelsQuery = useModels();
  const revisionsQuery = useRevisions(modelId);
  const revisionLogsQuery = useRevisionLogs({
    modelId,
    revisionId,
  });

  const {
    mutate: updateRevisionMutation,
    isLoading: updateInProgress,
  } = useUpdateRevisionMutation();

  const {
    mutate: deleteRevisionMutation,
    isLoading: deletionInProgress,
  } = useDeleteRevisionMutation();

  const revision = (revisionsQuery.data || []).find(
    (el) => el.id === revisionId
  );
  const model = (modelsQuery.data || []).find(
    (el) => el.id === Number(modelId)
  );
  const revisionLogs = revisionLogsQuery.data || [];

  useEffect(() => {
    let mounted = true;

    isReprocessingRequired(revisionId)
      .then((isRequired) => {
        if (mounted) {
          setViewerType(isRequired ? 'Legacy' : 'Reveal');
          setReprocessingRequired(isRequired);
        }
      })
      .catch(logToSentry);

    return () => {
      mounted = false;
    };
  }, [revisionId]);

  if (
    revisionsQuery.isLoading ||
    modelsQuery.isLoading ||
    revisionLogsQuery.isLoading ||
    !isFetchedUpdateCapabilities ||
    !isFetchedDeleteCapabilities
  ) {
    return <Spinner />;
  }

  if (!revision || !model) {
    return <NotFound />;
  }

  const switchRevisionPublication = async () => {
    if (!revision) {
      return;
    }

    const originalPublication = revision.published;

    metrics.track('TogglePublish', { state: originalPublication });

    await updateRevisionMutation(
      {
        modelId,
        revisionId,
        published: !revision.published,
      },
      {
        onSuccess: (updatedRevision: Revision3D) => {
          if (originalPublication !== updatedRevision.published) {
            message.success(
              `Revision successfully ${
                updatedRevision.published ? 'Published' : 'Unpublished'
              }`
            );
          }
        },
      }
    );
  };

  const showDeletionModal = () => {
    setDeletionModalVisible(true);
  };

  const deleteRevision = async () => {
    // navigate out before it's deleted, otherwise 404 component will be flashed for a moment
    props.history.push(createLink(`/3d-models`));
    await deleteRevisionMutation({ revisionId, modelId });
    message.success('Revision successfully deleted');
    metrics.track('Delete');
  };

  const onReprocessingRequestSent = () => {
    setReprocessingRequired(false);
  };

  const canBeViewed =
    revision.status === 'Done' ||
    Boolean(
      revisionLogs.find((log) => log.type === 'reveal-optimizer/Success')
    );

  const isReprocessingButtonVisible =
    (reprocessingRequired && canBeViewed) || alwaysShowReprocessingButton;

  return (
    <PageWithFixedWidth width={900}>
      <PageHeader
        title={`${APP_TITLE} / ${model.name}`}
        breadcrumbs={[
          {
            title: APP_TITLE,
            path: '/3d-models',
          },
          {
            title: `Model: ${model.name}`,
          },
          {
            title: `Revision: ${dayjs(revision.createdTime).format(
              'MMM D, YYYY h:mm A'
            )}`,
          },
        ]}
        help="https://docs.cognite.com/cdf/3d/guides/3dmodels_upload.html"
      />

      <Card>
        <h1>Revision Details</h1>
        <DetailsRowFlex>
          <div>
            <b>Model Name: </b>
          </div>
          <div>{model.name}</div>
        </DetailsRowFlex>
        <DetailsRowFlex>
          <div>
            <b>Date Created: </b>
          </div>
          <div>{dayjs(revision.createdTime).format('MMM D, YYYY h:mm A')}</div>
        </DetailsRowFlex>
        <DetailsRowFlex>
          <div>
            <b>Processing Status: </b>
          </div>
          <div style={{ minWidth: 0 }}>
            <Flex>
              <Status status={revision.status} />
              <ViewLogsButton
                size="small"
                type="secondary"
                icon={showLogs ? 'ArrowUp' : 'ArrowDown'}
                onClick={() => setShowLogs((prevState) => !prevState)}
              >
                View Logs
              </ViewLogsButton>
            </Flex>
            {showLogs && (
              <div style={{ overflow: 'hidden', marginTop: DEFAULT_MARGIN_V }}>
                <RevisionLogs
                  logs={revisionLogs}
                  isLoading={revisionLogsQuery.isLoading}
                />
              </div>
            )}
          </div>
        </DetailsRowFlex>
        <DetailsRowFlex>
          <div>
            <b>Published Status: </b>
            <Tooltip content={PUBLISH_STATUS_HINT}>
              <Icon type="Info" />
            </Tooltip>
          </div>
          <div>{revision.published ? 'Published' : 'Unpublished'}</div>
        </DetailsRowFlex>

        <ButtonRow>
          <PermissioningHintWrapper hasPermission={hasUpdateCapabilities}>
            <Button
              disabled={!hasUpdateCapabilities || updateInProgress}
              onClick={switchRevisionPublication}
              className="left-button"
              type={revision && revision.published ? 'secondary' : 'primary'}
            >
              {revision.published ? 'Unpublish' : 'Publish'}
            </Button>
          </PermissioningHintWrapper>
          {isReprocessingButtonVisible && (
            <PermissioningHintWrapper hasPermission={hasUpdateCapabilities}>
              <Button
                type="tertiary"
                className="left-button"
                disabled={!hasUpdateCapabilities}
                onClick={() => setReprocessingModalVisible(true)}
                title="Update model format to use the latest 3d-viewer features"
              >
                Reprocess
              </Button>
            </PermissioningHintWrapper>
          )}
          <PermissioningHintWrapper hasPermission={hasDeleteCapabilities}>
            <div className="right-button">
              <Tooltip content="Delete revision">
                <Button
                  aria-label="Delete revision"
                  type="ghost-danger"
                  icon="Delete"
                  disabled={!hasDeleteCapabilities || deletionInProgress}
                  onClick={showDeletionModal}
                />
              </Tooltip>
            </div>
          </PermissioningHintWrapper>
        </ButtonRow>
      </Card>

      <ErrorBoundary>
        <div
          style={{ textAlign: 'center', bottom: '0px', flex: 1, marginTop: 24 }}
        >
          {viewerType === 'Unknown' ? (
            <Spinner />
          ) : (
            <ThreeDViewerWrapper
              modelId={modelId}
              revision={revision}
              useOldViewer={viewerType === 'Legacy'}
              canBeViewed={canBeViewed}
            />
          )}
        </div>
      </ErrorBoundary>

      <Modal
        title="Confirm Deletion"
        visible={deletionModalVisible}
        onOk={deleteRevision}
        onCancel={() => setDeletionModalVisible(false)}
        width="400px"
        getContainer={getContainer}
      >
        Are you sure you want to delete this revision? This action cannot be
        undone.
      </Modal>

      <ReprocessingModal
        visible={reprocessingModalVisible}
        modelId={modelId}
        revision={revision}
        width="750px"
        onSuccess={onReprocessingRequestSent}
        onClose={() => setReprocessingModalVisible(false)}
      />
    </PageWithFixedWidth>
  );
}
