import type { ChangeEvent } from 'react';
import { useContext, useRef } from 'react';

import { Field, Form, Formik } from 'formik';
import styled from 'styled-components/macro';

import { Button, Input, Select, toast } from '@cognite/cogs.js';
import type {
  CreateMetadata,
  FileInfo,
  UpdateMetadata,
} from '@cognite/simconfig-api-sdk/rtk';
import {
  getTypedFormData,
  useCreateModelFileMutation,
  useUpdateModelFileVersionMutation,
} from '@cognite/simconfig-api-sdk/rtk';

import { FileInput } from 'components/forms/controls/FileInput';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { useAppSelector } from 'store/hooks';
import { selectSimulators } from 'store/simulator/selectors';
import { isAuthenticated } from 'utils/authUtils';
import {
  getFileExtensionFromFileName,
  getSelectEntriesFromMap,
  isValidExtension,
} from 'utils/formUtils';
import { isSuccessResponse } from 'utils/responseUtils';

import {
  BoundaryCondition,
  DEFAULT_MODEL_SOURCE,
  DEFAULT_UNIT_SYSTEM,
  FileExtensionToSimulator,
  UnitSystem,
} from './constants';
import { InputRow } from './elements';
import type { ModelFormState } from './types';

const getInitialModelFormState = (): ModelFormState => ({
  boundaryConditions: getSelectEntriesFromMap(BoundaryCondition),
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
});

const getSimulatorFromFileName = (fileName: string) => {
  const ext = getFileExtensionFromFileName(fileName);
  return isValidExtension(ext) && FileExtensionToSimulator[ext];
};

const acceptedFileTypes = Object.keys(FileExtensionToSimulator);

interface ComponentProps {
  initialModelFormState?: ModelFormState;
  onUpload?: (metadata: CreateMetadata | UpdateMetadata) => void;
}

export function ModelForm({
  initialModelFormState,
  onUpload,
}: React.PropsWithoutRef<ComponentProps>) {
  const inputFile = useRef<HTMLInputElement>(null);
  const { authState } = useContext(CdfClientContext);
  const simulators = useAppSelector(selectSimulators);

  const isNewModel = !initialModelFormState;
  const modelFormState = !initialModelFormState
    ? getInitialModelFormState()
    : initialModelFormState;

  const { dataSet } = simulators[0];
  modelFormState.fileInfo.dataSetId = dataSet;

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
  }: ModelFormState) => {
    if (!file) {
      throw new Error('Model file is missing');
    }
    if (!isAuthenticated(authState)) {
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
      userEmail: authState.email,
      simulator,
    };

    const boundaryConditions = formBoundaryConditions.map(
      (boundaryCondition) => boundaryCondition.value
    );

    if (isNewModel) {
      // Check for required property to narrow metadata type
      if (!('unitSystem' in metadata)) {
        throw new Error(`Missing required property: 'unitSystem'`);
      }

      const fileInfo: FileInfo = {
        ...formFileInfo,
        // Override linked values from metadata
        name: metadata.modelName,
        source: simulator,
      };

      const response = await createModel({
        project: authState.project,
        createModelFileRequestModel: getTypedFormData({
          boundaryConditions,
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
        project: authState.project,
        updateModelFileVersionRequestModel: getTypedFormData({
          file,
          metadata: {
            modelName,
            simulator,
            description,
            fileName,
            userEmail,
          },
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

  return (
    <Formik initialValues={modelFormState} onSubmit={onSubmit}>
      {({
        values: { file, metadata },
        setFieldValue,
        isSubmitting,
        errors,
        validateField,
      }) => (
        <Form>
          <InputRow>
            {file ? (
              <Field
                as={Input}
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
                setFieldValue('file', file);
                setFieldValue('metadata.fileName', file?.name);
              }}
            />
          </InputRow>
          <InputRow>
            <Field
              as={Input}
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
              maxLength={512}
              name="metadata.description"
              title="Description"
              fullWidth
            />
          </InputRow>

          {!isNewModel ? (
            <InputRow>
              <Input
                title="Unit system"
                value={UnitSystem[metadata.unitSystem]}
                disabled
                fullWidth
              />
            </InputRow>
          ) : (
            <>
              <InputRow>
                <Field
                  as={Select}
                  name="boundaryConditions"
                  options={getSelectEntriesFromMap(BoundaryCondition)}
                  title="Boundary conditions"
                  isMulti
                  required
                  onChange={(values: { label: string; value: string }[]) => {
                    setFieldValue('boundaryConditions', values);
                  }}
                />
              </InputRow>
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

const HiddenInputFile = styled.input`
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
`;
