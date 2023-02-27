import React, { useState } from 'react';
import styled from 'styled-components';
import { useMetrics } from 'hooks/useMetrics';
import { Model3D } from '@cognite/sdk';
import { DEFAULT_MARGIN_V, getContainer } from 'utils';
import PermissioningHintWrapper from 'components/PermissioningHintWrapper';
import { message, Card, Modal } from 'antd';
import { Button, Colors, Flex, Icon, Input } from '@cognite/cogs.js';
import Thumbnail from 'components/Thumbnail/Thumbnail';
import { createLink } from 'utils/cdf-utilities';

import FileUploader from 'pages/AllModels/components/FileUploader';

import { useDeleteModelMutation, useUpdateModelMutation } from 'hooks/models';
import { useCreateRevisionMutation, useRevisions } from 'hooks/revisions';

import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { useNavigate } from 'react-router-dom';
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
    margin-left: 0;
  }
  .right-button {
    align-self: end;
    margin-right: 0;
    margin-left: auto;
  }
`;

type Props = {
  model: Model3D;
};

export default function ModelRevisions({ model }: Props) {
  const metrics = useMetrics('3D');
  const navigate = useNavigate();

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newName, setNewName] = useState(model.name);

  const { mutate: deleteModelMutation } = useDeleteModelMutation();
  const { mutate: updateModelMutation } = useUpdateModelMutation();

  const { mutate: createRevision } = useCreateRevisionMutation();

  const revisionsQuery = useRevisions(model.id);

  const { flow } = getFlow();
  const { data: hasThreedDeleteCapability, isFetched: isFetchedThreedDelete } =
    usePermissions(flow, 'threedAcl', 'DELETE');
  const { data: hasThreedCreateCapability, isFetched: isFetchedThreedCreate } =
    usePermissions(flow, 'threedAcl', 'CREATE');
  const { data: hasFilesWriteCapability, isFetched: isFetchedFilesWrite } =
    usePermissions(flow, 'filesAcl', 'WRITE');

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
          color: Colors['text-icon--interactive--default'],
        }}
      >
        <Icon type="Loader" />
      </Flex>
    );
  }

  const showUploadModal = () => setUploadModalVisible(true);
  const hideUploadModal = () => setUploadModalVisible(false);

  const deleteModel = () => {
    metrics.track('Models.Delete');
    deleteModelMutation({ id: model.id });
    setDeletionModalVisible(false);
  };

  const renameModel = () => {
    if (newName !== model.name && newName !== '') {
      updateModelMutation({
        id: model.id,
        name: newName,
      });
    }

    setRenameModalVisible(false);
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
            type="destructive"
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
          modelId={model.id}
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
          navigate(
            createLink(`/3d-models/${model.id}/revisions/${revisionId}`)
          );
          metrics.track('Revisions.View');
        }}
        refresh={refresh}
      />
      <Modal
        title="Upload New Revision"
        open={uploadModalVisible}
        footer={null}
        closable={false}
        maskClosable={false}
        width="800px"
        getContainer={getContainer}
      >
        <FileUploader
          onUploadSuccess={async (fileId) => {
            await createRevision({
              fileId,
              modelId: model.id,
            });
            message.success('Revision created');
            hideUploadModal();
            metrics.track('Revisions.New');
          }}
          onUploadFailure={() => {
            refresh();
          }}
          onCancel={hideUploadModal}
          onDone={hideUploadModal}
        />
      </Modal>
      <Modal
        title="Confirm Deletion"
        open={deletionModalVisible}
        onOk={deleteModel}
        onCancel={() => setDeletionModalVisible(false)}
        width="400px"
        getContainer={getContainer}
      >
        Are you sure you want to delete
        <strong> {model.name}</strong>? This action cannot be undone.
      </Modal>
      <Modal
        open={renameModalVisible}
        onOk={renameModel}
        onCancel={() => {
          setRenameModalVisible(false);
          setNewName(model.name);
        }}
        title={`Rename ${model.name}`}
        getContainer={getContainer}
      >
        <p>Please Type the new name of this model: </p>
        <Input
          fullWidth
          placeholder="New Name"
          value={newName || ''}
          onChange={updateNewName}
        />
      </Modal>
    </RevisionWrapper>
  );
}
