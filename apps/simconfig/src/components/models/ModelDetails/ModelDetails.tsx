import { useEffect, useMemo, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-location';
import { useSelector } from 'react-redux';

import styled from 'styled-components/macro';

import {
  Button,
  Dropdown,
  Icon,
  Label,
  Menu,
  SegmentedControl,
  Skeleton,
  Tabs,
  toast,
} from '@cognite/cogs.js';
import type { ExternalId, Simulator } from '@cognite/simconfig-api-sdk/rtk';
import {
  useDeleteModelFileMutation,
  useGetModelFileQuery,
} from '@cognite/simconfig-api-sdk/rtk';

import { ModelForm } from 'components/forms/ModelForm';
import { CalculationList, ModelVersionList } from 'components/models';
import { useTitle } from 'hooks/useTitle';
import {
  selectIsDeleteEnabled,
  selectIsLabelsEnabled,
} from 'store/capabilities/selectors';
import { TRACKING_EVENTS } from 'utils/metrics/constants';
import { trackUsage } from 'utils/metrics/tracking';

import DeleteConfirmModal from './DeleteConfirmModal';
import { Divider } from './elements';
import { ModelLabels } from './ModelLabels';

import type { AppLocationGenerics } from 'routes';

interface ModelDetailsProps {
  project: string;
  modelName: string;
  simulator?: Simulator;
  refetchModelFiles: () => void;
  modelLibraryDeleteHandler?: () => void;
}

export function ModelDetails({
  project,
  modelName,
  simulator = 'UNKNOWN',
  refetchModelFiles,
  modelLibraryDeleteHandler,
}: ModelDetailsProps) {
  const {
    data: { definitions },
    params: { selectedTab = 'model-versions' },
  } = useMatch<AppLocationGenerics>();

  const isLabelsEnabled = useSelector(selectIsLabelsEnabled);
  const isDeleteEnabled = useSelector(selectIsDeleteEnabled);

  const navigate = useNavigate();
  const [showCalculations, setShowCalculations] = useState('configured');

  const [shouldShowDeleteConfirmModal, setShouldShowDeleteConfirmModal] =
    useState<boolean>(false);
  const [deletedModels, setDeletedModels] = useState<ExternalId[]>([]);
  const { data: modelFile, isFetching: isFetchingModelFile } =
    useGetModelFileQuery(
      { project, modelName, simulator },
      { skip: simulator === 'UNKNOWN', refetchOnMountOrArgChange: true }
    );

  const [deleteModelFile, { isSuccess: isDeleteModelSuccess }] =
    useDeleteModelFileMutation();

  useTitle(modelFile?.metadata.modelName);

  useEffect(() => {
    trackUsage(TRACKING_EVENTS.MODEL_DETAILS_VIEW, {
      modelName: decodeURI(modelName),
      simulator,
    });
  }, [modelName, simulator]);

  useEffect(() => {
    if (isDeleteModelSuccess && modelLibraryDeleteHandler) {
      modelLibraryDeleteHandler();
    }
  }, [isDeleteModelSuccess, modelLibraryDeleteHandler, modelName]);

  const handleDeleteModelConfirm = async (isConfirmed: boolean) => {
    setShouldShowDeleteConfirmModal(false);
    if (isConfirmed && modelFile?.externalId) {
      setDeletedModels([...deletedModels, modelFile.externalId]);
      await deleteModelFile({ project, simulator, modelName });
      toast.success(
        `${decodeURIComponent(modelName)} is deleted successfully`,
        { delay: 2000 }
      );
    }
  };

  const isDeletionInProgress = useMemo(() => {
    if (!modelFile) {
      return false;
    }
    return (
      (Boolean(modelFile.deletionStatus) &&
        !modelFile.deletionStatus?.erroredResources?.length) ||
      deletedModels.includes(modelFile.externalId)
    );
  }, [modelFile, deletedModels]);

  if (!isFetchingModelFile && !modelFile) {
    // Uninitialized state
    return null;
  }

  if (isFetchingModelFile) {
    return <Skeleton.List lines={2} />;
  }

  if (!modelFile) {
    // No model file returned
    throw new Error('No model file returned from backend');
  }

  const extraContent: Record<string, JSX.Element | undefined> = {
    calculations: (
      <SegmentedControl
        currentKey={showCalculations}
        size="small"
        onButtonClicked={setShowCalculations}
      >
        <SegmentedControl.Button key="configured">
          Configured
        </SegmentedControl.Button>
        <SegmentedControl.Button key="not-configured">
          Not configured
        </SegmentedControl.Button>
      </SegmentedControl>
    ),
  };

  return (
    <ModelDetailsContainer>
      <div className="header">
        <div className="metadata">
          <div>
            <span className="model-name">{modelFile.metadata.modelName}</span>
            <ul>
              <li>
                {definitions?.type.simulator[modelFile.metadata.simulator]},{' '}
              </li>
              <li>
                {definitions?.type.unitSystem[modelFile.metadata.unitSystem]},
              </li>
              {modelFile.metadata.modelType && (
                <li>{definitions?.type.model[modelFile.metadata.modelType]}</li>
              )}
              {isDeletionInProgress ? (
                <li>
                  <Label size="medium" variant="danger">
                    <Icon type="Loader" />
                    &nbsp;&nbsp; Deletion in progress
                  </Label>
                </li>
              ) : undefined}
              {modelFile.deletionStatus?.erroredResources?.length ? (
                <li>
                  <Label size="large" variant="danger">
                    Partial deleted model, some of the resources are not deleted
                  </Label>
                </li>
              ) : undefined}
            </ul>
          </div>

          {!isDeletionInProgress && isDeleteEnabled ? (
            <Dropdown
              content={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      setShouldShowDeleteConfirmModal(true);
                    }}
                  >
                    <Icon type="Delete" /> Delete model
                  </Menu.Item>
                </Menu>
              }
            >
              <Button
                aria-label="Actions"
                icon="ChevronDown"
                size="small"
                type="ghost"
              />
            </Dropdown>
          ) : undefined}
        </div>
        <div style={{ display: 'flex' }}>
          {isLabelsEnabled && (
            <ModelLabels
              modelFile={modelFile}
              refetchModelFiles={refetchModelFiles}
            />
          )}
          <Divider />
          {!(selectedTab === 'new-version') && (
            <Link to="../new-version">
              <Button
                icon="Add"
                size="large"
                type="primary"
                onClick={() => {
                  trackUsage(TRACKING_EVENTS.NEW_MODEL_VERSION, {
                    simulator,
                    modelName: decodeURI(modelName),
                  });
                }}
              >
                New version
              </Button>
            </Link>
          )}
        </div>
      </div>
      <Tabs
        activeKey={selectedTab}
        tabBarExtraContent={extraContent[selectedTab] ?? null}
        onChange={(tab) => {
          trackUsage(TRACKING_EVENTS.MODEL_CALC_LIST, {
            simulator,
            modelName: decodeURI(modelName),
          });
          navigate({ to: `../${tab}` });
        }}
      >
        <Tabs.TabPane
          key="model-versions"
          tab={
            <>
              <Icon type="History" /> Model versions
            </>
          }
        >
          <ModelVersionList
            modelName={modelFile.metadata.modelName}
            simulator={modelFile.metadata.simulator}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="calculations"
          tab={
            <>
              <Icon type="Function" /> Calculations
            </>
          }
        >
          <CalculationList
            modelName={modelName}
            showConfigured={showCalculations === 'configured'}
            simulator={simulator}
          />
        </Tabs.TabPane>
        {selectedTab === 'new-version' && (
          <Tabs.TabPane
            key="new-version"
            tab={
              <>
                <Icon type="Add" /> New version
              </>
            }
          >
            <ModelForm
              initialModelFormState={{
                fileInfo: {
                  ...modelFile,
                },
                metadata: {
                  ...modelFile.metadata,
                },
                boundaryConditions: [],
                labels: [],
                availableBoundaryConditions:
                  modelFile.availableBoundaryConditions ?? [],
              }}
              onUpload={() => {
                navigate({ to: '../model-versions' });
                // TODO(SIM-209): Invalidate model list
              }}
            />
          </Tabs.TabPane>
        )}
      </Tabs>
      <DeleteConfirmModal
        handleModalConfirm={handleDeleteModelConfirm}
        isModelOpen={shouldShowDeleteConfirmModal}
        modalName={modelName}
      />
    </ModelDetailsContainer>
  );
}

// not using main as cdf-simint-ui-style-scope overrides main to be display block
const ModelDetailsContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  flex: 1 1 auto;
  overflow: auto;
  padding: 24px 0 0 24px;
  height: 20vh;
  .header {
    display: flex;
    justify-content: space-between;
    padding-right: 20px;
    .metadata {
      margin-bottom: 12px;
      display: flex;

      align-items: baseline;
      gap: 12px;

      .model-name {
        font-weight: bold;
        font-size: 16px;
      }
      h2 {
        margin: 0;
        font-size: 36px;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        font-size: 12px;
        li {
          margin: 0;
          margin-right: 0.2em;
          padding: 0;
          &:not(:last-child) {
            &::after {
              margin-left: 5px;
              margin-right: 5px;
            }
          }
        }
      }
    }
  }

  .rc-tabs-nav {
    margin: 0 0 12px 0;
  }
  .rc-tabs {
    display: flex;
    flex: 1 1 auto;
    flex-flow: column nowrap;
    .rc-tabs-extra-content {
      margin: 0 24px 0 0;
      display: flex;
      align-items: center;
      .cogs-btn-tertiary {
        font-size: var(--cogs-detail-font-size);
        border-color: var(--cogs-primary);
        color: var(--cogs-primary);
      }
    }
    .rc-tabs-content-holder {
      overflow: auto;
      padding: 0 24px 24px 0;
    }
  }
  .rc-tabs-extra-content {
    gap: 12px;
  }

  // Missing popconfirm styles in the current version of cogs.js (5.2.1)
  .tippy-box[data-theme='cogs'] {
    background-color: var(--cogs-greyscale-grey9);
    border-radius: var(--cogs-border-radius--small);
    color: #ffffff;
    font-size: 14px;
    line-height: 1.4;
    outline: 0;
  }
  .tippy-box[data-theme='cogs'] .tippy-arrow {
    color: var(--cogs-greyscale-grey9);
  }
`;
