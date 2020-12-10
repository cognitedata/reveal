import styled from 'styled-components';
import { Card, Icon } from 'antd';
import { Button } from '@cognite/cogs.js';
import { RouteComponentProps } from 'react-router-dom';
import {
  isReprocessingRequired,
  APP_TITLE,
  getContainer,
  userHasCapabilities,
} from 'src/utils';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';
import { useMetrics } from '@cognite/metrics';
import React, { useEffect, useState } from 'react';
import message from 'antd/lib/message';

import { createLink, useUserContext } from '@cognite/cdf-utilities';
import dayjs from 'dayjs';
import Status from 'src/components/Status';
import NotFound from 'src/pages/NotFound';
import Spinner from 'src/components/Spinner';
import NewHeader from 'src/components/NewHeader';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Tooltip from 'antd/lib/tooltip';
import PermissioningHintWrapper from 'src/components/PermissioningHintWrapper';
import ErrorBoundary from 'src/components/ErrorBoundary';
import ThreeDViewerWrapper from 'src/pages/RevisionDetails/components/ThreeDViewerWrapper';
import Modal from 'antd/lib/modal';
import { ReprocessingModal } from 'src/pages/RevisionDetails/components/ReprocessingModal';
import { RevisionLogs } from 'src/pages/RevisionDetails/components/RevisionLogs';
import {
  useRevisions,
  useRevisionLogs,
  useUpdateRevisionMutation,
  useDeleteRevisionMutation,
} from 'src/hooks/revisions';
import { useModels } from 'src/hooks/models/useModels';

import { v3 } from '@cognite/cdf-sdk-singleton';

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
  padding: 6px 8px;
  font-size: 12px;
  && > span {
    margin-left: 6px;
  }
`;

type Props = RouteComponentProps<{
  modelId: string;
  revisionId: string;
}>;

export default function RevisionDetails(props: Props) {
  const user: AuthenticatedUserWithGroups = useUserContext();
  const metrics = useMetrics('3D.Revisions');

  const revisionId: number = Number(props.match.params.revisionId);
  const modelId: number = Number(props.match.params.modelId);

  const [showLogs, setShowLogs] = useState(false);
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [reprocessingRequired, setReprocessingRequired] = useState(false);
  const [reprocessingModalVisible, setReprocessingModalVisible] = useState(
    false
  );

  const modelsQuery = useModels();
  const revisionsQuery = useRevisions(modelId);
  const revisionLogsQuery = useRevisionLogs({
    modelId,
    revisionId,
  });

  const [
    updateRevisionMutation,
    { isLoading: updateInProgress },
  ] = useUpdateRevisionMutation();

  const [
    deleteRevisionMutation,
    { isLoading: deletionInProgress },
  ] = useDeleteRevisionMutation();

  const revision = (revisionsQuery.data || []).find(
    (el) => el.id === revisionId
  );
  const model = (modelsQuery.data || []).find(
    (el) => el.id === Number(modelId)
  );
  const revisionLogs = revisionLogsQuery.data || [];

  useEffect(() => {
    let mounted = true;

    if (revision) {
      isReprocessingRequired(revisionId)
        .then((isRequired) => {
          if (mounted) {
            setReprocessingRequired(isRequired);
          }
        })
        .catch();
    }

    return () => {
      mounted = false;
    };
  });

  if (
    revisionsQuery.isLoading ||
    modelsQuery.isLoading ||
    revisionLogsQuery.isLoading
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
        onSuccess: (updatedRevision: v3.Revision3D) => {
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

  const hasUpdateCapabilities = userHasCapabilities(user, [
    { acl: 'threedAcl', actions: ['UPDATE'] },
  ]);

  const hasDeleteCapabilities = userHasCapabilities(user, [
    { acl: 'threedAcl', actions: ['DELETE'] },
  ]);

  const canBeViewed =
    revision.status === 'Done' ||
    Boolean(
      revisionLogs.find((log) => log.type === 'reveal-optimizer/Success')
    );

  const isReprocessingButtonVisible = reprocessingRequired && canBeViewed;

  return (
    <PageWithFixedWidth width={900}>
      <NewHeader
        title={`${APP_TITLE} / ${model.name}`}
        breadcrumbs={[
          { title: 'Data catalog', path: '/data-catalog' },
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
        <Row type="flex" justify="start">
          <Col span={6}>
            <b>Model Name: </b>
          </Col>
          <Col span={18}>{model.name}</Col>
        </Row>
        <Row type="flex" justify="start">
          <Col span={6}>
            <b>Date Created: </b>
          </Col>
          <Col span={18}>
            {dayjs(revision.createdTime).format('MMM D, YYYY h:mm A')}
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <Col span={6}>
            <b>Processing Status: </b>
          </Col>
          <Col span={18}>
            <Status status={revision.status} />
            <ViewLogsButton
              size="small"
              type="secondary"
              icon={showLogs ? 'Up' : 'Down'}
              onClick={() => setShowLogs((prevState) => !prevState)}
            >
              View Logs
            </ViewLogsButton>
            {showLogs && (
              <RevisionLogs
                logs={revisionLogs}
                isLoading={revisionLogsQuery.isLoading}
              />
            )}
          </Col>
        </Row>
        <Row type="flex" justify="start">
          <Col span={6}>
            <b>Published Status: </b>
            <Tooltip
              title={PUBLISH_STATUS_HINT}
              getPopupContainer={getContainer}
            >
              <Icon type="info-circle" />
            </Tooltip>
          </Col>
          <Col span={18}>
            {revision.published ? 'Published' : 'Unpublished'}
          </Col>
        </Row>

        <ButtonRow>
          <PermissioningHintWrapper hasPermission={hasUpdateCapabilities}>
            <Button
              disabled={!hasUpdateCapabilities || updateInProgress}
              onClick={switchRevisionPublication}
              className="left-button"
              type={revision && revision.published ? 'danger' : 'primary'}
            >
              {revision.published ? 'Unpublish' : 'Publish Now!'}
            </Button>
          </PermissioningHintWrapper>
          <PermissioningHintWrapper hasPermission={hasDeleteCapabilities}>
            <Button
              type="danger"
              disabled={!hasDeleteCapabilities || deletionInProgress}
              className="left-button"
              onClick={showDeletionModal}
            >
              Delete Revision
            </Button>
          </PermissioningHintWrapper>
          {isReprocessingButtonVisible && (
            <PermissioningHintWrapper hasPermission={hasUpdateCapabilities}>
              <Button
                type="primary"
                variant="outline"
                className="left-button"
                disabled={!hasUpdateCapabilities}
                onClick={() => setReprocessingModalVisible(true)}
                title="Update model format to use the latest 3d-viewer features"
              >
                Reprocess
              </Button>
            </PermissioningHintWrapper>
          )}
        </ButtonRow>
      </Card>

      <ErrorBoundary>
        <div
          style={{ textAlign: 'center', bottom: '0px', flex: 1, marginTop: 24 }}
        >
          <ThreeDViewerWrapper
            modelId={modelId}
            revision={revision}
            useOldViewer={reprocessingRequired}
            canBeViewed={canBeViewed}
          />
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
