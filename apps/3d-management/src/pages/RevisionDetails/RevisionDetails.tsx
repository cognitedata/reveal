import React from 'react';
import { Metrics } from '@cognite/metrics';
import { createStructuredSelector, createSelector } from 'reselect';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Button } from '@cognite/cogs.js';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import message from 'antd/lib/message';
import Modal from 'antd/lib/modal';
import * as Sentry from '@sentry/browser';
import dayjs from 'dayjs';
import styled from 'styled-components';
import {
  projectName,
  userHasCapabilities,
  getContainer,
  APP_TITLE,
} from 'src/utils';
import { createLink } from '@cognite/cdf-utilities';
import { Card, Icon, Timeline } from 'antd';
import Tooltip from 'antd/lib/tooltip';
import PermissioningHintWrapper from 'src/components/PermissioningHintWrapper';
import Status, { mapStatusToColor } from 'src/components/Status';
import uniqBy from 'lodash/uniqBy';
import Spinner from 'src/components/Spinner';
import NewHeader from 'src/components/NewHeader';

import ErrorBoundary from 'src/components/ErrorBoundary';

import NotFound from 'src/pages/NotFound';
import * as ModelActions from 'src/store/modules/Model';
import * as RevisionActions from 'src/store/modules/Revision';
import {
  isReprocessingRequired,
  RevisionLog3D,
} from 'src/utils/sdk/3dApiUtils';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { RouteComponentProps } from 'react-router-dom';
import { AuthenticatedUserWithGroups } from '@cognite/cdf-utilities/dist/types';

import { ReprocessingModal } from 'src/pages/RevisionDetails/components/ReprocessingModal';
import isEqual from 'lodash/isEqual';
import { History } from 'history';
import ThreeDViewerWrapper from './components/ThreeDViewerWrapper';

export const PUBLISH_STATUS_HINT = `
  Publishing a Revision makes this version of
  the model accessible for users in other applications.
`;

const EXTERNAL_LOG_NAME = {
  'reveal-optimizer': 'Web-Optimizer',
};

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

const StyledCard = styled(Card)`
  && {
    margin-bottom: 24px;
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

const LogTimeline = styled(Timeline)`
  margin-top: 12px;
  && .ant-timeline-item-last > .ant-timeline-item-content {
    min-height: unset;
  }
  && p {
    margin-bottom: 2px;
  }
`;

const LogRow = styled.div`
  margin-top: 16px;
  display: flex;
  overflow: auto;
  && > div {
    flex: 1 220px;
    min-width: 220px;
    margin-right: 12px;
  }
`;

type Props = RouteComponentProps<{
  modelId: string;
  revisionId: string;
}> & {
  history: History;
  fetchModels: Function;
  fetchRevisionById: Function;
  updateRevision: Function;
  deleteRevision: Function;
  fetchRevisionLogs: Function;
  revisions: {
    isLoading: boolean;
    data: {
      extended: object; // ??? check if used and remove if not
      modelMap: number[];
      items: Array<{
        items: Array<v3.Revision3D>;
      }>;
    };
  };
  revisionLogs: Record<number, Array<RevisionLog3D> | undefined>;
  models: {
    data: {
      items: any; // fixme check types
    };
  };
  user: AuthenticatedUserWithGroups;
};

type State = {
  showLogs: boolean;
  deletionModalVisible: boolean;
  reprocessingRequired: boolean;
  reprocessingModalVisible: boolean;
  error: null | Error | v3.HttpError;
};

class RevisionDetails extends React.Component<Props, State> {
  metrics = Metrics.create('3D.Revisions');

  mounted = false;

  constructor(props: Props) {
    super(props);

    this.state = {
      showLogs: false,
      deletionModalVisible: false,
      reprocessingRequired: false,
      reprocessingModalVisible: false,
      error: null,
    };

    if (!this.revision) {
      this.refresh();
    } else {
      const { modelId, revisionId } = props.match.params;
      this.props.fetchRevisionLogs({
        modelId: Number(modelId),
        revisionId: Number(revisionId),
      });
    }
  }

  async componentDidMount() {
    this.mounted = true;

    const reprocessingRequired = await isReprocessingRequired(this.revisionId);
    if (this.mounted) {
      this.setState({ reprocessingRequired });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      !isEqual(this.props.match.params, prevProps.match.params) &&
      !this.revision
    ) {
      this.refresh();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  get revision(): v3.Revision3D | null {
    const { revisionId, modelId } = this.props.match.params;
    const { items: revisions, modelMap } = this.props.revisions.data;
    const idx = modelMap.indexOf(Number(modelId));
    if (idx === -1) {
      return null;
    }

    return revisions[idx].items.filter((el) => el.id === Number(revisionId))[0];
  }

  get revisionId(): number {
    return Number(this.props.match.params.revisionId);
  }

  get modelId(): number {
    return Number(this.props.match.params.modelId);
  }

  refresh = async () => {
    try {
      await this.props.fetchRevisionById({
        modelId: this.modelId,
        revisionId: this.revisionId,
      });
      await this.props.fetchModels();
      await this.props.fetchRevisionLogs({
        modelId: this.modelId,
        revisionId: this.revisionId,
      });
    } catch (error) {
      this.setState({ error });
    }
  };

  switchRevisionPublication = async () => {
    if (!this.revision) {
      return;
    }

    const { modelId, revisionId } = this.props.match.params;

    const originalPublication = this.revision.published;

    this.metrics.track('TogglePublish', { state: originalPublication });

    await this.props.updateRevision({
      modelId: Number(modelId),
      revisionId: Number(revisionId),
      published: !this.revision.published,
    });

    if (originalPublication !== this.revision.published) {
      message.success(
        `Revision successfully ${
          originalPublication ? 'Unpublished' : 'Published'
        }`
      );
    }
  };

  showDeletionModal = () => {
    this.setState({
      deletionModalVisible: true,
    });
  };

  deleteRevision = () => {
    const { modelId, revisionId } = this.props.match.params;

    this.metrics.track('Delete');
    this.props
      .deleteRevision({
        revisionId,
        modelId,
        projectName,
      })
      .then(() => {
        this.props.history.push(createLink(`/3d-models`));
      })
      .catch((err) => Sentry.captureException(err));
  };

  abortDelete = () => {
    this.setState({
      deletionModalVisible: false,
    });
  };

  showReprocessingModal = () => {
    this.setState({
      deletionModalVisible: false,
      reprocessingModalVisible: true,
    });
  };

  onReprocessingRequestSent = () => {
    this.refresh();
    this.setState({ reprocessingRequired: false });
  };

  dismissReprocessingModal = () => {
    this.setState({
      reprocessingModalVisible: false,
    });
  };

  formatDate = (date) => dayjs(date).format('YYYY-MM-DD HH:mm');

  logSection = () => {
    const logs = this.props.revisionLogs[this.revisionId];
    if (!logs || !logs.length) {
      return <div style={{ margin: '16px 0' }}>No logs found</div>;
    }
    // order by category of pipeline (the type is given as 3d-optimizer/status), so 3d-optimizer is the category
    const organizedLogs = logs.reduce((prev, log) => {
      const { timestamp, type, info } = log;
      const [category, status] = type.split('/');
      if (!prev[category]) {
        // eslint-disable-next-line no-param-reassign
        prev[category] = [{ timestamp, type: status, info }];
      } else {
        prev[category].push({ timestamp, type: status, info });
      }
      return prev;
    }, {});

    // make sure they are uniq and visible
    const visibleLogs = {};
    const isInternalUser =
      this.props.user.username?.indexOf('@cognite.com') !== -1;
    Object.keys(organizedLogs).forEach((process) => {
      if (isInternalUser) {
        visibleLogs[process] = uniqBy(
          organizedLogs[process],
          (el: any) => el.type + this.formatDate(el.timestamp)
        );
      } else {
        visibleLogs[EXTERNAL_LOG_NAME[process] || process] = uniqBy(
          organizedLogs[process],
          (el: any) => el.type + this.formatDate(el.timestamp)
        );
      }
    });
    return (
      <LogRow>
        {Object.keys(visibleLogs).map((process) => (
          <div key={process}>
            <b>{process.toUpperCase()}</b>
            <LogTimeline>
              {visibleLogs[process].map((log) => {
                const { timestamp, type, info } = log;
                return (
                  <Timeline.Item
                    key={`${type}-${timestamp}`}
                    color={mapStatusToColor[type]}
                  >
                    <b>{`${type}${info ? ` - ${info}` : ''}`}</b>
                    <p>{this.formatDate(timestamp)}</p>
                  </Timeline.Item>
                );
              })}
            </LogTimeline>
          </div>
        ))}
      </LogRow>
    );
  };

  render() {
    if (this.state.error) {
      if ('status' in this.state.error && this.state.error.status === 404) {
        return <NotFound />;
      }
      throw this.state.error;
    }
    const hasUpdateCapabilities = userHasCapabilities(this.props.user, [
      { acl: 'threedAcl', actions: ['UPDATE'] },
    ]);

    const showDeleteButton = userHasCapabilities(this.props.user, [
      { acl: 'threedAcl', actions: ['DELETE'] },
    ]);

    const { isLoading } = this.props.revisions;

    if (!this.revision || isLoading || !this.props.models.data.items) {
      return <Spinner />;
    }

    const { items } = this.props.models.data;
    const { modelId } = this.props.match.params;
    const model = items.find((el) => el.id === Number(modelId));

    const { showLogs } = this.state;

    const canBeViewed =
      this.revision.status === 'Done' ||
      Boolean(
        this.props.revisionLogs[this.revisionId]?.find(
          (log) => log.type === 'reveal-optimizer/Success'
        )
      );

    const isReprocessingButtonVisible =
      this.state.reprocessingRequired && canBeViewed;

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
              title: `Revision: ${dayjs(this.revision.createdTime).format(
                'MMM D, YYYY h:mm A'
              )}`,
            },
          ]}
          help="https://docs.cognite.com/cdf/3d/guides/3dmodels_upload.html"
        />

        <StyledCard>
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
              {dayjs(this.revision.createdTime).format('MMM D, YYYY h:mm A')}
            </Col>
          </Row>
          <Row type="flex" justify="start">
            <Col span={6}>
              <b>Processing Status: </b>
            </Col>
            <Col span={18}>
              <Status status={this.revision.status} />
              <ViewLogsButton
                size="small"
                type="secondary"
                icon={showLogs ? 'Up' : 'Down'}
                onClick={() => this.setState({ showLogs: !showLogs })}
              >
                View Logs
              </ViewLogsButton>
              {showLogs && this.logSection()}
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
              {this.revision.published ? 'Published' : 'Unpublished'}
            </Col>
          </Row>

          <ButtonRow>
            <PermissioningHintWrapper hasPermission={hasUpdateCapabilities}>
              <Button
                disabled={!hasUpdateCapabilities}
                onClick={this.switchRevisionPublication}
                className="left-button"
                type={
                  this.revision && this.revision.published
                    ? 'danger'
                    : 'primary'
                }
              >
                {this.revision.published ? 'Unpublish' : 'Publish Now!'}
              </Button>
            </PermissioningHintWrapper>
            <PermissioningHintWrapper hasPermission={showDeleteButton}>
              <Button
                type="danger"
                disabled={!showDeleteButton}
                className="left-button"
                onClick={this.showDeletionModal}
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
                  onClick={this.showReprocessingModal}
                  title="Update model format to use the latest 3d-viewer features"
                >
                  Reprocess
                </Button>
              </PermissioningHintWrapper>
            )}
          </ButtonRow>
        </StyledCard>

        <ErrorBoundary>
          <div style={{ textAlign: 'center', bottom: '0px', flex: 1 }}>
            <ThreeDViewerWrapper
              modelId={this.modelId}
              revision={this.revision}
              useOldViewer={this.state.reprocessingRequired}
              canBeViewed={canBeViewed}
            />
          </div>
        </ErrorBoundary>

        <Modal
          title="Confirm Deletion"
          visible={this.state.deletionModalVisible}
          onOk={this.deleteRevision}
          onCancel={this.abortDelete}
          width="400px"
          getContainer={getContainer}
        >
          Are you sure you want to delete this revision? This action cannot be
          undone.
        </Modal>

        <ReprocessingModal
          visible={this.state.reprocessingModalVisible}
          modelId={this.modelId}
          revision={this.revision}
          width="750px"
          onSuccess={this.onReprocessingRequestSent}
          onClose={this.dismissReprocessingModal}
        />
      </PageWithFixedWidth>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  revisions: createSelector(
    (state: any) => state.revisions,
    (revisionState) => revisionState
  ),
  revisionLogs: createSelector(
    (state: any) => state.revisions,
    (revisionState) => revisionState.data.logs
  ),
  models: createSelector(
    (state: any) => state.models,
    (modelState) => modelState
  ),
});

function mapDispatchToProps(dispatch) {
  // @ts-ignore 😭 untyped redux hits hard
  return bindActionCreators({ ...ModelActions, ...RevisionActions }, dispatch);
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(RevisionDetails)
);
