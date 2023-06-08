import { Model3D } from '@cognite/sdk';
import { useMetrics } from '@3d-management/hooks/useMetrics';
import React, { ChangeEvent, useState } from 'react';
import ModelRevisions from '@3d-management/pages/AllModels/components/ModelRevisions/ModelRevisions';
import {
  APP_TITLE,
  DEFAULT_MARGIN_V,
  getContainer,
} from '@3d-management/utils';
import { Modal, Steps, message } from 'antd';

import { Button, Flex, Input } from '@cognite/cogs.js';
import FileUploader from '@3d-management/pages/AllModels/components/FileUploader';
import Spinner from '@3d-management/components/Spinner';
import { PageHeader } from '@3d-management/components/PageHeader';
import PermissioningHintWrapper from '@3d-management/components/PermissioningHintWrapper';
import ModelsTable from '@3d-management/pages/AllModels/components/ModelsTable/ModelsTable';

import styled from 'styled-components';
import { useCreateModelMutation } from '@3d-management/hooks/models';
import { useModels } from '@3d-management/hooks/models/useModels';
import { useCreateRevisionMutation } from '@3d-management/hooks/revisions';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { useParams } from 'react-router-dom';

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

export default function AllModels() {
  const metrics = useMetrics('3D');
  const modelsQuery = useModels();
  const props = useParams();

  const { data: models } = modelsQuery;

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
  const { data: hasThreedCreateCapability, isFetched: isFetchedThreedCreate } =
    usePermissions(flow as any, 'threedAcl', 'CREATE');
  const { data: hasFilesWriteCapability, isFetched: isFetchedFilesWrite } =
    usePermissions(flow as any, 'filesAcl', 'WRITE');

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

  if (modelsQuery.isLoading || !isFetchedFilesWrite || !isFetchedThreedCreate) {
    return <Spinner />;
  }

  return (
    <div>
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

      <ModelsTable
        models={models || []}
        expandedRowRender={expandedRowRender}
        refresh={modelsQuery.refetch}
      />
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
    </div>
  );
}
