import { ChangeEvent, lazy, useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import {
  ResourceTypeTabs,
  ThreeDSearchContextProvider,
} from '@data-exploration/containers';
import { Modal, Steps, message } from 'antd';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { Button, Flex, Input, Tabs } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { PageHeader } from '../../components/PageHeader';
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
import { ThreeSixtySearchResults } from './components/ModelsTable/ThreeSixtySearchResults';
import { ResourceType } from './types';
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

  const nextStep = () => {
    setCurrentUploadStep((prevStep: number) => prevStep + 1);
  };

  const previousStep = () => {
    if (currentUploadStep > 0) {
      setCurrentUploadStep((prevStep: number) => prevStep - 1);
    }
  };

  const { flow } = getFlow();
  const { data: hasThreedReadCapability } = usePermissions(
    flow as any,
    'threedAcl',
    'READ'
  );
  const { data: hasThreedCreateCapability, isFetched: isFetchedThreedCreate } =
    usePermissions(flow as any, 'threedAcl', 'CREATE');
  const { data: hasFilesWriteCapability, isFetched: isFetchedFilesWrite } =
    usePermissions(flow as any, 'filesAcl', 'WRITE');

  const modelsQuery = useModels({ enabled: hasThreedReadCapability });
  const { data: models } = modelsQuery;

  const showAddModelButton =
    hasThreedCreateCapability && hasFilesWriteCapability;

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
    !isFetchedFilesWrite ||
    !isFetchedThreedCreate
  ) {
    return <Spinner />;
  }

  if (!hasThreedReadCapability && !models) {
    return <NoAccessPage />;
  }

  return (
    <AllModelsWrapper>
      <TabsContainer>
        <ResourceTypeTabs
          currentResourceType={currentResourceType}
          setCurrentResourceType={(tab) => {
            setCurrentResourceType(tab as ResourceType);
          }}
        >
          <Tabs.Tab tabKey="3D models" label="3D models">
            <PageHeader
              title={APP_TITLE}
              breadcrumbs={[{ title: APP_TITLE, path: '/3d-models' }]}
              help="https://docs.cognite.com/cdf/3d/"
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
            <ModelsTable //TODO: Make the 3D models table look nicer. Tracked by: https://cognitedata.atlassian.net/browse/BND3D-2226
              models={models ?? []}
              expandedRowRender={expandedRowRender}
              refresh={modelsQuery.refetch}
            />
          </Tabs.Tab>
          <Tabs.Tab tabKey="360 images" label="360 images">
            <ThreeDSearchContextProvider>
              <ThreeSixtySearchResults />
            </ThreeDSearchContextProvider>
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
    </AllModelsWrapper>
  );
};
