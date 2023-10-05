import { ChangeEvent, lazy, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import {
  ThreeDSearchContextProvider,
  ResourceTypeTabs,
  ResourceSelectorDrawer,
} from '@data-exploration/containers';
import { Modal, Steps, message } from 'antd';

import {
  Button,
  Flex,
  Input,
  Tabs,
  Modal as CogsModal,
} from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { ResourceItem } from '@data-exploration-lib/core';

import {
  BreadcrumbsThreeDManagement,
  HeaderItemsThreeDManagement,
} from '../../components/PageHeader';
import PermissioningHintWrapper from '../../components/PermissioningHintWrapper';
import Spinner from '../../components/Spinner';
import { useCreateModelMutation } from '../../hooks/models';
import { useModels } from '../../hooks/models/useModels';
import { useCreateRevisionMutation } from '../../hooks/revisions';
import { useMetrics } from '../../hooks/useMetrics';
import { APP_TITLE, DEFAULT_MARGIN_V, getContainer } from '../../utils';

import FileUploader from './components/FileUploader';
import ModelRevisions from './components/ModelRevisions/ModelRevisions';
import ModelsTable from './components/ModelsTable/ModelsTable';
import { updateFilesMetadataFor360Contextualization } from './components/ModelsTable/ThreeSixtyContextualization';
import { ThreeSixtySearchResults } from './components/ModelsTable/ThreeSixtySearchResults';
import { ResourceType } from './types';
import { useThreeDPermissions } from './useThreeDPermissions';

const INITIAL_WIDTH_RESOURCE_SELECTOR = 700;

const { Step } = Steps;

const TabsContainer = styled.div`
  flex: 0 0 auto;
`;

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

const AllModelsWrapper = styled.div`
  padding: 24px 40px;
`;

const NoAccessPage = lazy(() => import('../NoAccessPage'));

export const AllModels = () => {
  const metrics = useMetrics('3D');

  const props = useParams();

  const sdk = useSDK();
  const [currentResourceType, setCurrentResourceType] =
    useState<ResourceType>('3D models');

  const { mutate: createModel } = useCreateModelMutation();
  const { mutate: createRevision } = useCreateRevisionMutation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newModelName, setNewModelName] = useState('');
  const [currentUploadStep, setCurrentUploadStep] = useState<number>(0);
  const [createdModel, setCreatedModel] = useState<Model3D>();

  const [isResourceSelectorOpen, setIsResourceSelectorOpen] = useState(false);
  const [isAssetTagModalVisible, setIsAssetTagModalVisible] = useState(false);
  const [selectedResourceItem, setSelectedResourceItem] =
    useState<ResourceItem | null>(null);
  const [selectedImage360Collection, setSelectedImage360Collection] = useState<
    string | null
  >(null);

  const isFormFilled = newModelName.length > 0;

  const expandedRowRender = (model: Model3D) => (
    <ModelRevisions model={model} {...props} />
  );

  const closeModal = () => {
    setIsModalVisible(false);
    setNewModelName('');
    setCreatedModel(undefined);
    setCurrentUploadStep(0);
  };

  const closeAssetTagModal = () => {
    setIsAssetTagModalVisible(false);
    onCloseResourceSelector();
  };

  const onCloseResourceSelector = () => {
    setIsResourceSelectorOpen(false);
  };

  const onOpenResourceSelector = () => {
    setIsResourceSelectorOpen(true);
  };

  const handleThreeSixtyContextualization = () => {
    closeAssetTagModal();
    if (selectedResourceItem === null || selectedImage360Collection === null) {
      return;
    }
    updateFilesMetadataFor360Contextualization({
      sdk,
      selectedResourceItem,
      selectedImage360Collection,
    });
  };

  const nextStep = () => {
    setCurrentUploadStep((prevStep: number) => prevStep + 1);
  };

  const previousStep = () => {
    if (currentUploadStep > 0) {
      setCurrentUploadStep((prevStep: number) => prevStep - 1);
    }
  };

  const threeDPermissions = useThreeDPermissions();

  const modelsQuery = useModels({
    enabled: threeDPermissions.hasThreeDReadCapability,
  });

  const handleResourceSelect = useCallback(
    (item) => {
      setSelectedResourceItem(item);
      setIsAssetTagModalVisible(true);
    },
    [setIsAssetTagModalVisible]
  );

  const onRunAssetTagClick = (image360id: string) => {
    setSelectedImage360Collection(image360id);
    onOpenResourceSelector();
  };

  const { data: models } = modelsQuery;

  const showAddModelButton =
    threeDPermissions.hasThreeDCreateCapability &&
    threeDPermissions.hasFilesWriteCapability;

  const showAssetTagDetectionButton =
    threeDPermissions.hasFilesReadCapability &&
    threeDPermissions.hasFilesWriteCapability &&
    threeDPermissions.hasLabelsReadCapability &&
    threeDPermissions.hasLabelsWriteCapability;

  const modelUploadSteps = [
    {
      title: 'Name Your Model',
      content: (
        <div>
          <Flex
            alignItems="center"
            justifyContent="space-between"
            style={{
              margin: `${DEFAULT_MARGIN_V}px 0`,
            }}
          >
            <div>Input Model Name:</div>
            <Input
              placeholder="Model Name"
              value={newModelName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewModelName(e.target.value)
              }
            />
          </Flex>

          <ButtonRow>
            <Button onClick={closeModal}>Cancel</Button>
            <Button
              onClick={nextStep}
              disabled={!isFormFilled}
              type="primary"
              icon="Checkmark"
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
          sdk={sdk}
          beforeUploadStart={async () => {
            metrics.track('Models.Add');
            await createModel(
              { name: newModelName },
              {
                onSuccess: (model) => setCreatedModel(model),
              }
            );
          }}
          onUploadSuccess={async (fileId) => {
            message.success(
              'Upload complete, starting processing job to render 3d model'
            );
            metrics.track('Revisions.New');

            if (createdModel) {
              await createRevision({
                fileId,
                modelId: createdModel.id,
              });
            }
            closeModal();
            modelsQuery.refetch();
          }}
          onUploadFailure={() => {
            modelsQuery.refetch();
          }}
          onCancel={previousStep}
          onDone={closeModal}
        />
      ),
    },
  ];

  if (
    modelsQuery.isInitialLoading ||
    !threeDPermissions.isFetchedFilesWrite ||
    !threeDPermissions.isFetchedThreeDCreate
  ) {
    return <Spinner />;
  }

  if (!threeDPermissions.hasThreeDReadCapability && !models) {
    return <NoAccessPage />;
  }

  return (
    <AllModelsWrapper>
      <BreadcrumbsThreeDManagement
        breadcrumbs={[{ title: APP_TITLE, path: '/3d-models' }]}
        help="https://docs.cognite.com/cdf/3d/"
      ></BreadcrumbsThreeDManagement>
      <TabsContainer>
        <ResourceTypeTabs
          currentResourceType={currentResourceType}
          setCurrentResourceType={(tab) => {
            setCurrentResourceType(tab as ResourceType);
          }}
        >
          <Tabs.Tab tabKey="3D models" label="3D models">
            <HeaderItemsThreeDManagement
              rightItem={
                <TableOperations>
                  <PermissioningHintWrapper hasPermission={showAddModelButton}>
                    <Button
                      type="primary"
                      disabled={!showAddModelButton}
                      onClick={() => setIsModalVisible(true)}
                    >
                      Add model
                    </Button>
                  </PermissioningHintWrapper>
                </TableOperations>
              }
            />
            <div style={{ paddingTop: '20px', width: '100%' }}>
              <ModelsTable
                models={models ?? []}
                expandedRowRender={expandedRowRender}
                refresh={modelsQuery.refetch}
              />
            </div>
          </Tabs.Tab>

          <Tabs.Tab tabKey="360 images" label="360 images">
            <ThreeDSearchContextProvider>
              <ThreeSixtySearchResults
                showAssetTagDetectionButton={showAssetTagDetectionButton}
                onRunAssetTagClick={onRunAssetTagClick}
              />
            </ThreeDSearchContextProvider>
            {isResourceSelectorOpen && (
              <ResourceSelectorDrawer
                initialWidth={INITIAL_WIDTH_RESOURCE_SELECTOR}
                selectionMode="single"
                visibleResourceTabs={['asset']}
                visible={isResourceSelectorOpen}
                onSelect={handleResourceSelect}
                onClose={onCloseResourceSelector}
              />
            )}
          </Tabs.Tab>
        </ResourceTypeTabs>
      </TabsContainer>

      <Modal
        title="Insert New Model"
        open={isModalVisible}
        footer={null}
        closable={false}
        maskClosable={false}
        width={currentUploadStep ? '800px' : undefined}
        getContainer={getContainer}
      >
        <Steps progressDot current={currentUploadStep} size="small">
          {modelUploadSteps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>
        <div>{modelUploadSteps[currentUploadStep].content}</div>
      </Modal>

      <CogsModal
        title="Run Asset tag detection"
        visible={isAssetTagModalVisible}
        onOk={handleThreeSixtyContextualization}
        onCancel={closeAssetTagModal}
      >
        <p>
          Do you want to run Asset tag detection on image360collection{' '}
          <span style={{ fontWeight: 'bold' }}>
            {selectedImage360Collection}
          </span>{' '}
          with asset hierarchy{' '}
          <span style={{ fontWeight: 'bold' }}>
            {selectedResourceItem?.externalId}
          </span>
          ?
        </p>
      </CogsModal>
    </AllModelsWrapper>
  );
};
