import React from 'react';
import { Metrics } from '@cognite/metrics';
import { createStructuredSelector, createSelector } from 'reselect';
import { Button } from '@cognite/cogs.js';
import Card from 'antd/lib/card';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { projectName, userHasCapabilities, getContainer } from 'src/utils';
import { createLink } from '@cognite/cdf-utilities';
import PermissioningHintWrapper from 'src/components/PermissioningHintWrapper';
import Spinner from 'src/components/Spinner';

import * as RevisionActions from 'src/store/modules/Revision';
import Thumbnail from 'src/components/Thumbnail';
import * as FileActions from 'src/store/modules/File';
import { RouteComponentProps } from 'react-router';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';
import RevisionsTable from '../RevisionsTable';
import FileUploader from '../FileUploader';

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
  history: History;
  fetchRevisions: Function;
  fetchUrlForUpload: Function;
  createNewRevision: Function;
  deleteExistingModel: Function;
  changeModelName: Function;
  fileToUpload: {
    data: {
      uploadURL: string;
      fileId: number;
    };
  };
  revisions: {
    data: {
      modelMap: Array<number>;
      loaded: Array<number>;
      items: Array<{
        items: Array<any>;
      }>;
    };
    errorHandler: {
      response: {
        message: string;
      };
    };
  };
  model: {
    id: number;
    name: string;
  };
  user: AuthenticatedUserWithGroups;
};

type State = {
  uploadModalVisible: boolean;
  deletionModalVisible: boolean;
  renameModalVisible: boolean;
  newName: string;
};

class AllRevisions extends React.PureComponent<Props, State> {
  metrics = Metrics.create('3D');

  constructor(props) {
    super(props);

    this.state = {
      uploadModalVisible: false,
      deletionModalVisible: false,
      renameModalVisible: false,
      newName: '',
    };
  }

  componentDidMount() {
    const { loaded } = this.props.revisions.data;
    const index = loaded.filter((el) => el === this.props.model.id)[0];
    if (index === undefined) {
      this.props.fetchRevisions({
        modelId: this.props.model.id,
      });
    }
  }

  componentDidUpdate(nextProps) {
    const { modelMap } = nextProps.revisions.data;
    const index = modelMap.indexOf(nextProps.model.id);

    if (index === -1) {
      this.props.fetchRevisions({
        modelId: nextProps.model.id,
      });
    }
  }

  showUploadModal = () => {
    this.setState({
      uploadModalVisible: true,
    });
  };

  hideUploadModal = () => {
    this.setState({
      uploadModalVisible: false,
    });
  };

  showDeletionModal = () => {
    this.setState({
      deletionModalVisible: true,
    });
  };

  renameModelModal = () => {
    this.setState({
      renameModalVisible: true,
    });
  };

  deleteModel = () => {
    this.props.deleteExistingModel({
      modelId: this.props.model.id,
    });

    this.metrics.track('Models.Delete');

    this.setState({
      deletionModalVisible: false,
    });
  };

  renameModel = () => {
    if (
      this.state.newName !== this.props.model.name &&
      this.state.newName !== ''
    ) {
      this.props.changeModelName({
        modelId: this.props.model.id,
        modelName: this.state.newName,
      });
    }

    this.setState({
      renameModalVisible: false,
      newName: '',
    });
  };

  hideModalVisibility = () => {
    this.setState({
      renameModalVisible: false,
    });
  };

  abortDelete = () => {
    this.setState({
      deletionModalVisible: false,
    });
  };

  updateNewName = (event) => {
    this.setState({ newName: event.target.value });
  };

  refresh = () => {
    this.props.fetchRevisions({
      modelId: this.props.model.id,
    });
  };

  render() {
    const showDeleteModelButton = userHasCapabilities(this.props.user, [
      { acl: 'threedAcl', actions: ['DELETE'] },
    ]);
    const showButtons = userHasCapabilities(this.props.user, [
      { acl: 'threedAcl', actions: ['CREATE'] },
      { acl: 'filesAcl', actions: ['WRITE'] },
    ]);
    const { modelMap, items } = this.props.revisions.data;
    const index = modelMap.indexOf(this.props.model.id);
    const revisions = items[index];
    if (revisions === undefined) {
      return <Spinner />;
    }

    return (
      <RevisionWrapper>
        <ButtonRow>
          <PermissioningHintWrapper hasPermission={showButtons}>
            <Button
              className="left-button"
              type="primary"
              disabled={!showButtons}
              onClick={this.showUploadModal}
            >
              Upload new revision
            </Button>
            <Button
              className="left-button"
              type="secondary"
              disabled={!showButtons}
              onClick={this.renameModelModal}
            >
              Rename this Model
            </Button>
          </PermissioningHintWrapper>
          <PermissioningHintWrapper hasPermission={showDeleteModelButton}>
            <Button
              type="danger"
              className="right-button"
              disabled={!showDeleteModelButton}
              onClick={this.showDeletionModal}
            >
              Delete model
            </Button>
          </PermissioningHintWrapper>
        </ButtonRow>

        {/* @ts-ignore */}
        <Card style={{ align: 'center', width: '100%' }}>
          <Thumbnail
            modelId={this.props.model.id}
            width="400px"
            style={{
              display: 'block',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
        </Card>

        <RevisionsTable
          revisions={revisions}
          onRowClick={(record) => {
            this.props.history.push(
              createLink(
                `/3d-models/${this.props.model.id}/revisions/${record.id}`
              )
            );
            this.metrics.track('Revisions.View');
          }}
          refresh={this.refresh}
        />
        <Modal
          title="Upload New Revision"
          visible={this.state.uploadModalVisible}
          footer={null}
          onCancel={this.hideUploadModal}
          width="800px"
          getContainer={getContainer}
        >
          <FileUploader
            onUploadSuccess={async (fileId) => {
              await this.props.createNewRevision({
                fileId,
                modelId: this.props.model.id,
                projectName,
              });

              this.hideUploadModal();
              this.metrics.track('Revisions.New');
            }}
            onUploadFailure={() => {
              this.hideUploadModal();
            }}
          />
        </Modal>
        <Modal
          title="Confirm Deletion"
          visible={this.state.deletionModalVisible}
          onOk={this.deleteModel}
          onCancel={this.abortDelete}
          width="400px"
          getContainer={getContainer}
        >
          Are you sure you want to delete
          <strong> {this.props.model.name}</strong>? This action cannot be
          undone.
        </Modal>
        <Modal
          visible={this.state.renameModalVisible}
          onOk={this.renameModel}
          onCancel={this.hideModalVisibility}
          width="400px"
          title={`Rename ${this.props.model.name}`}
          getContainer={getContainer}
        >
          <p>Please Type the new name of this model: </p>
          <Input
            placeholder="New Name"
            value={this.state.newName || this.props.model.name}
            onChange={this.updateNewName}
          />
        </Modal>
      </RevisionWrapper>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  revisions: createSelector(
    (state: any) => state.revisions,
    (revisionState) => revisionState
  ),
  fileToUpload: createSelector(
    (state: any) => state.files,
    (filesState) => filesState
  ),
});

function mapDispatchToProps(dispatch) {
  // @ts-ignore
  return bindActionCreators({ ...RevisionActions, ...FileActions }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AllRevisions);
