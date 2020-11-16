import React from 'react';
import { Metrics } from '@cognite/metrics';
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

import NewHeader from 'src/components/NewHeader';
import { userHasCapabilities, getContainer, APP_TITLE } from 'src/utils';

import Spinner from 'src/components/Spinner';

import FileUploader from 'src/pages/AllModels/components/FileUploader';
import PermissioningHintWrapper from 'src/components/PermissioningHintWrapper';
import * as FileActions from 'src/store/modules/File';
import AllRevisions from 'src/pages/AllModels/components/AllRevisions';
import ModelsTable from 'src/pages/AllModels/components/ModelsTable';
import * as RevisionActions from 'src/store/modules/Revision';
import * as ModelActions from 'src/store/modules/Model';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';

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

type Props = {
  clearRevisions: Function;
  fetchModels: Function;
  createNewModel: Function;
  fetchUrlForUpload: Function;
  createNewRevision: Function;
  models?: { isLoading: boolean; data: { items: Array<v3.Model3D> } };
  fileToUpload: {
    data: {
      uploadURL: string;
      fileId: number;
    };
  };
  user: AuthenticatedUserWithGroups;
  clearLocalModels: Function;
};

type State = {
  modalVisible: boolean;
  nameVal: string;
  currentUploadStep: number;
  newModel?: v3.Model3D;
};

const defaultState: State = {
  modalVisible: false,
  nameVal: '',
  currentUploadStep: 0,
  newModel: undefined,
};

class AllModels extends React.Component<Props, State> {
  // fixme doesn't make any sense?
  static defaultProps = {
    models: { items: undefined },
  };

  metrics = Metrics.create('3D');

  constructor(props) {
    super(props);
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
        newModel: response.payload[0] as v3.Model3D,
      });
    }
  };

  input = (key: keyof State, ev: any) => {
    // @ts-ignore
    this.setState({
      [key]: ev.target.value,
    });
  };

  render() {
    const { items: models } = this.props.models?.data || {};
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
              // fixme: then doesnt make sense
              await this.createModel().then(() => this.state.newModel);
              this.metrics.track('Models.Add');
            }}
            onUploadSuccess={async (fileId) => {
              await this.props.createNewRevision({
                fileId,
                modelId: this.state.newModel!.id,
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
    (state: any) => state.models,
    (modelState) => modelState
  ),
  fileToUpload: createSelector(
    (state: any) => state.files,
    (filesState) => filesState
  ),
});

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    // @ts-ignore
    { ...ModelActions, ...RevisionActions, ...FileActions },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(AllModels);
