import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMatch } from 'react-location';
import { useSelector } from 'react-redux';

import { Field, Form, Formik } from 'formik';
import styled from 'styled-components/macro';

import { Button, Input, Select, toast } from '@cognite/cogs.js';
import type { DataSet } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import type {
  CreateMetadata,
  DefinitionMap,
  FileInfo,
  Simulator,
  SimulatorInstance,
  UpdateMetadata,
} from '@cognite/simconfig-api-sdk/rtk';
import {
  getTypedFormData,
  useCreateModelFileMutation,
  useGetMetadataResourceQuery,
  useGetSimulatorsListQuery,
  useUpdateModelFileVersionMutation,
} from '@cognite/simconfig-api-sdk/rtk';

import { FileInput } from 'components/forms/controls/FileInput';
import { HEARTBEAT_POLL_INTERVAL } from 'components/simulator/constants';
import { SimulatorStatusLabel } from 'components/simulator/SimulatorStatusLabel';
import { useUserInfo } from 'hooks/useUserInfo';
import { selectCapabilities } from 'store/capabilities/selectors';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import {
  getFileExtensionFromFileName,
  getSelectEntriesFromMap,
  isValidExtension,
} from 'utils/formUtils';
import { isSuccessResponse } from 'utils/responseUtils';

import { LabelsInput } from '../controls/LabelsInput';

import {
  DEFAULT_MODEL_SOURCE,
  DEFAULT_UNIT_SYSTEM,
  FileExtensionToSimulator,
  UnitSystem,
} from './constants';
import { InputRow } from './elements';
import type { BoundaryConditionResponse, ModelFormState } from './types';

import type { AppLocationGenerics } from 'routes';

const getInitialModelFormState = (
  boundaryConditionsData: DefinitionMap['type']['boundaryCondition'] | undefined
): ModelFormState => ({
  boundaryConditions: getSelectEntriesFromMap(boundaryConditionsData),
  labels: [],
  file: undefined,
  metadata: {
    modelName: '',
    simulator: DEFAULT_MODEL_SOURCE,
    description: '',
    fileName: '',
    unitSystem: DEFAULT_UNIT_SYSTEM,
    userEmail: '',
  },
  fileInfo: {
    name: '',
    source: DEFAULT_MODEL_SOURCE,
  },
  availableBoundaryConditions: [],
});

const getSimulatorFromFileName = (fileName: string) => {
  const ext = getFileExtensionFromFileName(fileName);
  return isValidExtension(ext) && FileExtensionToSimulator[ext];
};

function SimulatorStatusDropdown({
  dataset,
  simulators,
}: {
  dataset: DataSet | undefined;
  simulators: SimulatorInstance[];
}) {
  const associatedSimulator = simulators.find(
    ({ dataSetId }) => dataSetId === dataset?.id
  );
  return (
    <SimulatorStatusDropdownContainer>
      {dataset?.name} - {dataset?.id}
      {associatedSimulator && (
        <SimulatorStatusLabel
          simulator={associatedSimulator}
          title={associatedSimulator.simulator}
        />
      )}
    </SimulatorStatusDropdownContainer>
  );
}

const acceptedFileTypes = Object.keys(FileExtensionToSimulator);

interface ComponentProps {
  initialModelFormState?: ModelFormState;
  onUpload?: (metadata: CreateMetadata | UpdateMetadata) => void;
}

export function ModelForm({
  initialModelFormState,
  onUpload,
}: React.PropsWithoutRef<ComponentProps>) {
  const capabilities = useSelector(selectCapabilities);
  const inputFile = useRef<HTMLInputElement>(null);
  const [datasets, setDatasets] = useState<DataSet[]>();
  const client = useSDK();
  const { data: user } = useUserInfo();

  // state to find which simulator was selected after uploading the model file
  const [selectedSimulator, setSelectedSimulator] = useState<Simulator>();

  const labelsFeature = capabilities.capabilities?.find(
    (feature) => feature.name === 'Labels'
  );
  const isLabelsEnabled = labelsFeature?.capabilities?.every(
    (capability) => capability.enabled
  );
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const project = useSelector(selectProject);
  const { data: simulatorsList } = useGetSimulatorsListQuery(
    { project },
    { pollingInterval: HEARTBEAT_POLL_INTERVAL }
  );

  const {
    data: simulatorBoundaryConditions,
    isSuccess: isBoundaryConditionsSuccess,
    isError: isBoundaryConditionsError,
  } = useGetMetadataResourceQuery(
    {
      metadataResourceType: 'boundary_conditions',
      simulator: selectedSimulator ?? 'PROSPER',
      project,
    },
    { skip: !selectedSimulator }
  );

  const boundaryConditionsData = useMemo(() => {
    if (isBoundaryConditionsError) {
      return definitions?.type.boundaryCondition;
    }
    if (!isBoundaryConditionsSuccess) {
      return undefined;
    }
    return (
      simulatorBoundaryConditions as BoundaryConditionResponse
    ).items.reduce<Record<string, string>>(
      (result, { key, name }) => ({
        ...result,
        [key]: name,
      }),
      {}
    ) as DefinitionMap['type']['boundaryCondition'];
  }, [
    definitions?.type.boundaryCondition,
    isBoundaryConditionsError,
    isBoundaryConditionsSuccess,
    simulatorBoundaryConditions,
  ]);

  useEffect(() => {
    const getDatasets = async () => {
      const { items } = await client.datasets.list();
      setDatasets(items);
    };
    void getDatasets();
  }, [client]);

  const isNewModel = !initialModelFormState;

  const modelFormState = !initialModelFormState
    ? getInitialModelFormState(boundaryConditionsData)
    : initialModelFormState;

  const onButtonClick = () => {
    if (inputFile.current) {
      inputFile.current.click();
    }
  };

  const [createModel] = useCreateModelFileMutation();
  const [updateModelVersion] = useUpdateModelFileVersionMutation();

  const onSubmit = async ({
    file,
    fileInfo: formFileInfo,
    metadata: formMetadata,
    boundaryConditions: formBoundaryConditions,
    labels: formLabels,
  }: ModelFormState) => {
    if (!file) {
      throw new Error('Model file is missing');
    }
    if (!user) {
      throw new Error('User is not authenticated');
    }
    // simulator name is chosen based on the extension of the filename
    const simulator = getSimulatorFromFileName(formMetadata.fileName);

    if (!simulator) {
      throw new Error('Invalid file type');
    }

    // User e-mail is always set to the currently logged in user, incuding for new versions
    const metadata: CreateMetadata | UpdateMetadata = {
      ...formMetadata,
      userEmail: user.mail,
      simulator,
    };

    const labels = formLabels.map((label) => ({ labelName: label.label }));
    const boundaryConditions = formBoundaryConditions.map(
      (boundaryCondition) => boundaryCondition.value
    );

    if (isNewModel) {
      // Check for required property to narrow metadata type
      if (!('unitSystem' in metadata)) {
        throw new Error(`Missing required property: 'unitSystem'`);
      }

      if (!('modelType' in metadata)) {
        toast.error('Missing required property: Please select Model Type');
        return;
      }

      const fileInfo: FileInfo = {
        ...formFileInfo,
        // Override linked values from metadata
        name: metadata.modelName,
        source: simulator,
      };
      const response = await createModel({
        project,
        createModelFileRequestModel: getTypedFormData({
          boundaryConditions,
          labels,
          file,
          fileInfo,
          metadata,
        }),
      });
      if (isSuccessResponse(response)) {
        toast.success(response.data.message);
      }
    } else {
      const { modelName, simulator, description, fileName, userEmail } =
        metadata;

      const response = await updateModelVersion({
        project,
        updateModelFileVersionRequestModel: getTypedFormData({
          file,
          metadata: {
            modelName,
            simulator,
            description,
            fileName,
            userEmail,
          },
          boundaryConditions,
        }),
      });
      if (isSuccessResponse(response)) {
        toast.success(response.data.message);
      }
    }

    if (onUpload) {
      onUpload(metadata);
    }
  };

  const validateFilename = (value: string) => {
    if (!value) {
      return undefined;
    }
    const ext = getFileExtensionFromFileName(value);

    if (!isValidExtension(ext)) {
      return 'Invalid file type';
    }
    return undefined;
  };

  const isValidFile = (fileName: string): boolean => {
    const ext = getFileExtensionFromFileName(fileName);
    return isValidExtension(ext);
  };

  const getLatestSimulatorByFileExtension = (fileName: string | undefined) => {
    const extensionToSimulator =
      FileExtensionToSimulator[
        fileName ? getFileExtensionFromFileName(fileName) : 'UNKNOWN'
      ];

    setSelectedSimulator(extensionToSimulator);

    return simulatorsList?.simulators?.find(
      (connectorSimulator) =>
        connectorSimulator.simulator === extensionToSimulator
    )?.dataSetId;
  };

  return (
    <Formik initialValues={modelFormState} onSubmit={onSubmit}>
      {({
        values: { file, metadata, fileInfo },
        setFieldValue,
        isSubmitting,
        errors,
        validateField,
      }) => (
        <Form>
          <InputRow>
            {file ? (
              <Field
                as={RegularInput}
                error={
                  errors.metadata?.fileName
                    ? errors.metadata.fileName
                    : undefined
                }
                helpText={
                  isValidFile(metadata.fileName)
                    ? `Simulator: ${metadata.simulator}`
                    : undefined
                }
                icon="Document"
                isValid={isValidFile(metadata.fileName)}
                maxLength={512}
                name="metadata.fileName"
                postfix={<Button onClick={onButtonClick}>File</Button>}
                title="File name"
                validate={validateFilename}
                disabled
                fullWidth
              />
            ) : (
              <Field
                as={FileInput}
                extensions={acceptedFileTypes}
                validate={validateFilename}
                onFileSelected={(file?: File) => {
                  setFieldValue('file', file);
                  setFieldValue('metadata.fileName', file?.name);
                  setFieldValue(
                    'fileInfo.dataSetId',
                    getLatestSimulatorByFileExtension(file?.name)
                  );
                  setFieldValue(
                    'metadata.simulator',
                    FileExtensionToSimulator[
                      file?.name
                        ? getFileExtensionFromFileName(file.name)
                        : 'UNKNOWN'
                    ]
                  );
                  validateField('metadata.fileName');
                }}
              />
            )}
            <HiddenInputFile
              accept={acceptedFileTypes.join(',')}
              id="file-upload"
              ref={inputFile}
              type="file"
              onChange={(event: ChangeEvent<HTMLInputElement>) => {
                const file = event.currentTarget.files?.[0];
                setFieldValue(
                  'fileInfo.dataSetId',
                  getLatestSimulatorByFileExtension(file?.name)
                );
                setFieldValue('file', file);
                setFieldValue('metadata.fileName', file?.name);
              }}
            />
          </InputRow>
          <InputRow>
            <Field
              as={RegularInput}
              disabled={!isNewModel}
              helpText="Only alphanumeric characters, spaces ( ), underscores (_) and dashes (-) are allowed."
              maxLength={256}
              name="metadata.modelName"
              pattern="^[A-Za-z0-9_ -]*$"
              title="Model name"
              fullWidth
              required
            />
          </InputRow>
          <InputRow>
            <Field
              as={Input}
              maxLength={200}
              name="metadata.description"
              title="Description"
              fullWidth
            />
          </InputRow>

          {!isNewModel ? (
            <>
              <InputRow>
                <RegularInput
                  title="Unit system"
                  value={UnitSystem[metadata.unitSystem]}
                  disabled
                  fullWidth
                />
              </InputRow>
              <InputRow>
                <Field
                  as={Select}
                  name="boundaryConditions"
                  options={modelFormState.availableBoundaryConditions.map(
                    ({ key, name }) => ({ label: name, value: key })
                  )}
                  title="Additional boundary conditions"
                  isMulti
                  required
                  onChange={(values: { label: string; value: string }[]) => {
                    setFieldValue('boundaryConditions', values);
                  }}
                />
              </InputRow>
            </>
          ) : (
            <>
              {isLabelsEnabled && <LabelsInput setFieldValue={setFieldValue} />}
              <InputRow>
                <Field
                  as={Select}
                  name="metadata.modelType"
                  options={getSelectEntriesFromMap(definitions?.type.model)}
                  title="Model type"
                  value={{
                    value: metadata.modelType,
                    label: metadata.modelType
                      ? definitions?.type.model[metadata.modelType]
                      : null,
                  }}
                  closeMenuOnSelect
                  required
                  onChange={({ value }: { value: string }) => {
                    setFieldValue('metadata.modelType', value);
                  }}
                />
              </InputRow>
              <InputRow>
                <Field
                  as={Select}
                  name="fileInfo.dataSetId"
                  options={datasets?.map((dataset) => ({
                    label: (
                      <SimulatorStatusDropdown
                        dataset={dataset}
                        simulators={simulatorsList?.simulators ?? []}
                      />
                    ),
                    value: dataset.id,
                  }))}
                  title="Data set"
                  value={
                    fileInfo.dataSetId && {
                      value: fileInfo.dataSetId,
                      label: (
                        <SimulatorStatusDropdown
                          dataset={datasets?.find(
                            (dataset) => dataset.id === fileInfo.dataSetId
                          )}
                          simulators={simulatorsList?.simulators ?? []}
                        />
                      ),
                    }
                  }
                  closeMenuOnSelect
                  required
                  onChange={({ value }: { value: string }) => {
                    setFieldValue('fileInfo.dataSetId', value);
                  }}
                />
              </InputRow>
              {selectedSimulator && boundaryConditionsData ? (
                <InputRow>
                  <Field
                    as={Select}
                    name="boundaryConditions"
                    options={getSelectEntriesFromMap(boundaryConditionsData)}
                    title="Boundary conditions"
                    isMulti
                    required
                    onChange={(values: { label: string; value: string }[]) => {
                      setFieldValue('boundaryConditions', values);
                    }}
                  />
                </InputRow>
              ) : undefined}

              <InputRow>
                <Field
                  as={Select}
                  name="metadata.unitSystem"
                  options={getSelectEntriesFromMap(UnitSystem)}
                  title="Unit system"
                  value={{
                    value: metadata.unitSystem,
                    label: UnitSystem[metadata.unitSystem],
                  }}
                  closeMenuOnSelect
                  onChange={({ value }: { value: string }) => {
                    setFieldValue('metadata.unitSystem', value);
                  }}
                />
              </InputRow>
            </>
          )}
          <div>
            <Button
              disabled={isSubmitting}
              htmlType="submit"
              icon="Add"
              loading={isSubmitting}
              type="primary"
            >
              {isNewModel ? 'Create new model' : 'Upload new version'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}

const RegularInput = styled(Input)`
  .title {
    text-transform: none;
  }
`;

const HiddenInputFile = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;

export const InputButton = styled.div`
  display: flex;
  .cogs-select {
    width: 86%;
    margin-right: 1em;
  }
`;

const SimulatorStatusDropdownContainer = styled.div`
  display: flex;
  gap: 12px;
`;
