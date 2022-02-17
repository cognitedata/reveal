import { RouteComponentProps } from 'react-router';
import styled from 'styled-components';
import { useMetrics } from 'hooks/useMetrics';
import React, { useState } from 'react';
import { Model3D } from '@cognite/sdk';
import { DEFAULT_MARGIN_V, getContainer } from 'utils';
import PermissioningHintWrapper from 'components/PermissioningHintWrapper';
import { message, Card, Modal } from 'antd';
import { Button, Colors, Flex, Icon, Input } from '@cognite/cogs.js';
import Thumbnail from 'components/Thumbnail/Thumbnail';
import { createLink } from '@cognite/cdf-utilities';

import FileUploader from 'pages/AllModels/components/FileUploader';

import { useDeleteModelMutation, useUpdateModelMutation } from 'hooks/models';
import { useCreateRevisionMutation, useRevisions } from 'hooks/revisions';

import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { RevisionsTable } from './RevisionsTable';

const RevisionWrapper = styled.div`
  margin-top: 20px;

  button {
    margin-bottom: 10px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  margin-top: 20px;

  .left-button {
    align-self: start;
    margin-right: 12px;
    margin-left: 0px;
  }
  .right-button {
    align-self: end;
    margin-right: 0;
    margin-left: auto;
  }
`;

type Props = RouteComponentProps & {
  model: Model3D;
};

export default function ModelRevisions(props: Props) {
  const metrics = useMetrics('3D');

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  const { mutate: deleteModelMutation } = useDeleteModelMutation();
  const { mutate: updateModelMutation } = useUpdateModelMutation();

  const { mutate: createRevision } = useCreateRevisionMutation();
  const revisionsQuery = useRevisions(props.model.id);

  const { flow } = getFlow();
  const {
    data: hasThreedDeleteCapability,
    isFetched: isFetchedThreedDelete,
  } = usePermissions(flow, 'threedAcl', 'DELETE');
  const {
    data: hasThreedCreateCapability,
    isFetched: isFetchedThreedCreate,
  } = usePermissions(flow, 'threedAcl', 'CREATE');
  const {
    data: hasFilesWriteCapability,
    isFetched: isFetchedFilesWrite,
  } = usePermissions(flow, 'filesAcl', 'WRITE');

  const showDeleteModelButton = hasThreedDeleteCapability;
  const showButtons = hasThreedCreateCapability && hasFilesWriteCapability;

  if (
    revisionsQuery.isLoading ||
    !isFetchedThreedCreate ||
    !isFetchedThreedDelete ||
    !isFetchedFilesWrite
  ) {
    return (
      <Flex
        alignItems="center"
        justifyContent="center"
        style={{
          height: 40,
          margin: DEFAULT_MARGIN_V,
          color: Colors.primary.hex(),
        }}
      >
        <Icon type="Loading" />
      </Flex>
    );
  }

  const showUploadModal = () => setUploadModalVisible(true);
  const hideUploadModal = () => setUploadModalVisible(false);

  const deleteModel = () => {
    metrics.track('Models.Delete');
    deleteModelMutation({ id: props.model.id });
    setDeletionModalVisible(false);
  };

  const renameModel = () => {
    if (newName !== props.model.name && newName !== '') {
      updateModelMutation({
        id: props.model.id,
        name: newName,
      });
    }

    setRenameModalVisible(false);
    setNewName('');
  };

  const updateNewName = (event) => {
    setNewName(event.target.value);
  };

  const refresh = () => {
    revisionsQuery.refetch();
  };

  return (
    <RevisionWrapper>
      <ButtonRow>
        <PermissioningHintWrapper hasPermission={showButtons}>
          <Button
            className="left-button"
            type="primary"
            disabled={!showButtons}
            onClick={showUploadModal}
          >
            Upload new revision
          </Button>
          <Button
            className="left-button"
            type="secondary"
            disabled={!showButtons}
            onClick={() => setRenameModalVisible(true)}
          >
            Rename this Model
          </Button>
        </PermissioningHintWrapper>
        <PermissioningHintWrapper hasPermission={showDeleteModelButton}>
          <Button
            type="danger"
            className="right-button"
            disabled={!showDeleteModelButton}
            onClick={() => setDeletionModalVisible(true)}
          >
            Delete model
          </Button>
        </PermissioningHintWrapper>
      </ButtonRow>

      <Card style={{ width: '100%' }}>
        <Thumbnail
          modelId={props.model.id}
          width="400px"
          style={{
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />
      </Card>

      <RevisionsTable
        revisions={revisionsQuery.data || []}
        onRowClick={(revisionId) => {
          props.history.push(
            createLink(`/3d-models/${props.model.id}/revisions/${revisionId}`)
          );
          metrics.track('Revisions.View');
        }}
        refresh={refresh}
      />
      <Modal
        title="Upload New Revision"
        visible={uploadModalVisible}
        footer={null}
        onCancel={hideUploadModal}
        width="800px"
        getContainer={getContainer}
      >
        <FileUploader
          onUploadSuccess={async (fileId) => {
            await createRevision({
              fileId,
              modelId: props.model.id,
            });
            message.success('Revision created');
            hideUploadModal();
            metrics.track('Revisions.New');
          }}
          onUploadFailure={() => {
            hideUploadModal();
          }}
          onCancel={hideUploadModal}
        />
      </Modal>
      <Modal
        title="Confirm Deletion"
        visible={deletionModalVisible}
        onOk={deleteModel}
        onCancel={() => setDeletionModalVisible(false)}
        width="400px"
        getContainer={getContainer}
      >
        Are you sure you want to delete
        <strong> {props.model.name}</strong>? This action cannot be undone.
      </Modal>
      <Modal
        visible={renameModalVisible}
        onOk={renameModel}
        onCancel={() => setRenameModalVisible(false)}
        title={`Rename ${props.model.name}`}
        getContainer={getContainer}
      >
        <p>Please Type the new name of this model: </p>
        <Input
          fullWidth
          placeholder="New Name"
          value={newName || props.model.name}
          onChange={updateNewName}
        />
      </Modal>
    </RevisionWrapper>
  );
}
