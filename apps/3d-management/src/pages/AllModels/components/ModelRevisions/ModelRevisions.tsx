import { RouteComponentProps } from 'react-router';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';
import styled from 'styled-components';
import { useMetrics } from '@cognite/metrics';
import React, { useState } from 'react';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { getContainer, userHasCapabilities } from 'src/utils';
import Spinner from 'src/components/Spinner';
import PermissioningHintWrapper from 'src/components/PermissioningHintWrapper';
import { Button } from '@cognite/cogs.js';
import Card from 'antd/lib/card';
import Thumbnail from 'src/components/Thumbnail/Thumbnail';
import { createLink } from '@cognite/cdf-utilities';
import Modal from 'antd/lib/modal';
import FileUploader from 'src/pages/AllModels/components/FileUploader';
import Input from 'antd/lib/input';
import {
  useDeleteModelMutation,
  useUpdateModelMutation,
} from 'src/hooks/models';
import { useCreateRevisionMutation, useRevisions } from 'src/hooks/revisions';
import message from 'antd/lib/message';
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
  model: v3.Model3D;
  user: AuthenticatedUserWithGroups;
};

export default function ModelRevisions(props: Props) {
  const metrics = useMetrics('3D');

  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [deletionModalVisible, setDeletionModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  const [deleteModelMutation] = useDeleteModelMutation();
  const [updateModelMutation] = useUpdateModelMutation();

  const [createRevision] = useCreateRevisionMutation();
  const revisionsQuery = useRevisions(props.model.id);

  if (revisionsQuery.isLoading) {
    return <Spinner />;
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

  const showDeleteModelButton = userHasCapabilities(props.user, [
    { acl: 'threedAcl', actions: ['DELETE'] },
  ]);
  const showButtons = userHasCapabilities(props.user, [
    { acl: 'threedAcl', actions: ['CREATE'] },
    { acl: 'filesAcl', actions: ['WRITE'] },
  ]);

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
        width="400px"
        title={`Rename ${props.model.name}`}
        getContainer={getContainer}
      >
        <p>Please Type the new name of this model: </p>
        <Input
          placeholder="New Name"
          value={newName || props.model.name}
          onChange={updateNewName}
        />
      </Modal>
    </RevisionWrapper>
  );
}
