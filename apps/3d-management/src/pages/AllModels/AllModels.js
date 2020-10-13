import React from 'react';
import { Metrics } from '@cognite/metrics';
import PropTypes from 'prop-types';
import { createStructuredSelector, createSelector } from 'reselect';
import { Button } from '@cognite/cogs.js';
import Modal from 'antd/lib/modal';
import Input from 'antd/lib/input';
import message from 'antd/lib/message';
import Steps from 'antd/lib/steps';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import NewHeader from 'components/NewHeader';
import { userHasCapabilities, getContainer, APP_TITLE } from 'utils';

import Spinner from 'components/Spinner';
import { userPropType } from 'utils/PropTypes';

import FileUploader from 'components/FileUploader';
import PermissioningHintWrapper from 'components/PermissioningHintWrapper';
import * as FileActions from 'store/modules/File';
import AllRevisions from 'components/AllRevisions';
import ModelsTable from 'components/ModelsTable';
import * as RevisionActions from 'store/modules/Revision';
import * as ModelActions from 'store/modules/Model';

const { Step } = Steps;

const TableOperations = styled.div`
  margin: 20px 0 16px 0;
  position: relative;

  button {
    margin-right: 8px;
  }
  button:nth-child(2) {
    position: absolute;
    right: 0;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  margin-top: 20px;

  button:nth-child(2) {
    align-self: end;
    margin-right: 0;
    margin-left: auto;
  }

  button:nth-child(3) {
    align-self: end;
    margin-right: 0;
    margin-left: 10px;
  }
`;

const propTypes = {
  clearRevisions: PropTypes.func.isRequired,
  fetchModels: PropTypes.func.isRequired,
  createNewModel: PropTypes.func.isRequired,
  fetchUrlForUpload: PropTypes.func.isRequired,
  createNewRevision: PropTypes.func.isRequired,
  models: PropTypes.shape({
    data: PropTypes.shape({
      items: PropTypes.array,
    }),
  }),
  fileToUpload: PropTypes.shape({
    data: PropTypes.shape({
      uploadURL: PropTypes.string,
      fileId: PropTypes.number,
    }).isRequired,
  }).isRequired,
  user: userPropType.isRequired,
  clearLocalModels: PropTypes.func.isRequired,
};

const defaultProps = {
  models: { items: undefined },
};

const defaultState = {
  modalVisible: false,
  nameVal: '',
  currentUploadStep: 0,
  newModel: undefined,
};

class AllModels extends React.Component {
  metrics = Metrics.create('3D');

  constructor(props) {
    super(props);
    // eslint-disable-next-line react/state-in-constructor
    this.state = {
      ...defaultState,
    };
  }

  componentDidMount() {
    this.props.fetchModels();
  }

  get isFormFilled() {
    return this.state.nameVal.length > 0;
  }

  showSuccessMessage = () => {
    message.success('Added new model!');
    this.setState({
      modalVisible: false,
      nameVal: '',
    });
  };

  refresh = () => {
    this.props.fetchModels();
    this.props.clearRevisions();
  };

  expandedRowRender = (model) => <AllRevisions model={model} {...this.props} />;

  showModal = () => {
    this.setState({ modalVisible: true });
  };

  closeModal = () => {
    this.setState({ modalVisible: false });
  };

  nextStep = () => {
    this.setState((prevState) => ({
      currentUploadStep: prevState.currentUploadStep + 1,
    }));
  };

  previousStep = () => {
    if (this.state.currentUploadStep > 0) {
      this.setState((prevState) => ({
        currentUploadStep: prevState.currentUploadStep - 1,
      }));
    }
  };

  createModel = async () => {
    message.info('Adding new model...');
    const response = await this.props.createNewModel({
      modelName: this.state.nameVal,
    });

    if (response.payload && response.payload[0]) {
      this.setState({
        newModel: response.payload[0],
      });
    }
  };

  input = (key, ev) => {
    this.setState({
      [key]: ev.target.value,
    });
  };

  render() {
    const { items: models } = this.props.models.data;
    const showAddModelButton = userHasCapabilities(this.props.user, [
      { acl: 'threedAcl', actions: ['CREATE'] },
      { acl: 'filesAcl', actions: ['WRITE'] },
    ]);

    const modelUploadSteps = [
      {
        title: 'Name Your Model',
        content: (
          <div>
            <Row gutter={8} type="flex" align="middle">
              <Col span={12}>
                <div>Input Model Name:</div>
              </Col>
              <Col span={12}>
                <Input
                  placeholder="Model Name"
                  required
                  value={this.state.nameVal}
                  onChange={(ev) => this.input('nameVal', ev)}
                />
              </Col>
            </Row>

            <ButtonRow>
              <Button onClick={this.closeModal}>Cancel</Button>
              <Button
                onClick={this.nextStep}
                disabled={!this.isFormFilled}
                type="primary"
                icon="Check"
              >
                Create New Model
              </Button>
            </ButtonRow>
          </div>
        ),
      },
      {
        title: 'Upload an Initial Model',
        content: (
          <FileUploader
            beforeUploadStart={async () => {
              await this.createModel().then(() => this.state.newModel);
              this.metrics.track('Models.Add');
            }}
            uploadData={(fileName, fileType) =>
              this.props
                .fetchUrlForUpload({
                  fileName,
                  fileType,
                })
                .then(() => this.props.fileToUpload.data)
            }
            onUploadSuccess={async (fileId) => {
              await this.props.createNewRevision({
                fileId,
                modelId: this.state.newModel.id,
              });

              this.metrics.track('Revisions.New');

              this.props.clearLocalModels();

              this.props.fetchModels();

              this.setState(defaultState);
            }}
            onUploadFailure={() => {
              this.closeModal();
              this.setState({
                newModel: undefined,
              });
            }}
            onCancel={this.previousStep}
          />
        ),
      },
    ];

    if (!models) {
      return <Spinner />;
    }
    return (
      <div>
        <NewHeader
          title={APP_TITLE}
          breadcrumbs={[
            { title: 'Data catalog', path: '/data-catalog' },
            { title: APP_TITLE, path: '/3d-models' },
          ]}
          help="https://docs.cognite.com/cdf/3d/"
          rightItem={
            <TableOperations>
              <PermissioningHintWrapper hasPermission={showAddModelButton}>
                <Button
                  type="primary"
                  disabled={!showAddModelButton}
                  onClick={this.showModal}
                >
                  Add model
                </Button>
              </PermissioningHintWrapper>
            </TableOperations>
          }
        />

        <ModelsTable
          models={models}
          expandedRowRender={this.expandedRowRender}
          refresh={this.refresh}
        />
        <Modal
          title="Insert New Model"
          visible={this.state.modalVisible}
          onCancel={this.closeModal}
          footer={null}
          getContainer={getContainer}
        >
          <Steps
            progressDot
            current={this.state.currentUploadStep}
            size="small"
          >
            {modelUploadSteps.map((item) => (
              <Step key={item.title} title={item.title} />
            ))}
          </Steps>
          <div>{modelUploadSteps[this.state.currentUploadStep].content}</div>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  models: createSelector(
    (state) => state.models,
    (modelState) => modelState
  ),
  fileToUpload: createSelector(
    (state) => state.files,
    (filesState) => filesState
  ),
});

AllModels.defaultProps = defaultProps;
AllModels.propTypes = propTypes;

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    { ...ModelActions, ...RevisionActions, ...FileActions },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(AllModels);
