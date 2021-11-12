import { useContext, useRef, ChangeEvent } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Input, Select } from '@cognite/cogs.js';
import { FileInput } from 'components/forms/controls/FileInput';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { Field, Form, Formik, FormikProps } from 'formik';
import { useSelector } from 'react-redux';
import { selectDatasets } from 'store/dataset/selectors';
import { selectUploadDatasetIds } from 'store/group/selectors';
import { ApiContext } from 'providers/ApiProvider';
import { HiddenInputFile } from 'components/forms/controls/elements';
import {
  getFileExtensionFromFileName,
  getSelectEntriesFromMap,
  isValidExtension,
} from 'utils/formUtils';
import {
  CreateMetadataModel,
  FileInfoModel,
  UpdateMetadataModel,
} from '@cognite/simconfig-api-sdk';

import { InputRow } from './elements';
import { ModelFormState } from './types';
import {
  BoundaryCondition,
  DEFAULT_MODEL_SOURCE,
  DEFAULT_UNIT_SYSTEM,
  FileExtensionToSimulator,
  UnitSystem,
} from './constants';

const getInitialModelFormState = (): ModelFormState => ({
  boundaryConditions: [],
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
}

export function ModelForm({
  initialModelFormState,
}: React.PropsWithoutRef<ComponentProps>) {
  const history = useHistory();
  const inputFile = useRef<HTMLInputElement>(null);
  const { api } = useContext(ApiContext);
  const { authState } = useContext(CdfClientContext);

  const datasets = useSelector(selectDatasets);
  const scopes = useSelector(selectUploadDatasetIds);

  const isNewModel = !initialModelFormState;
  const modelFormState = !initialModelFormState
    ? getInitialModelFormState()
    : initialModelFormState;

  const formDatasets: { [key: number]: string } = datasets
    .filter((it) => scopes.includes(it.id))
    .reduce((datasets, { id, name }) => ({ ...datasets, [id]: name }), {});

  if (!modelFormState.fileInfo.dataSetId) {
    modelFormState.fileInfo.dataSetId = datasets[0]?.id;
  }

  const onButtonClick = () => {
    if (inputFile.current) {
      inputFile.current.click();
    }
  };

  const onSubmit = async ({
    file,
    fileInfo: formFileInfo,
    metadata: formMetadata,
    boundaryConditions: formBoundaryConditions,
  }: ModelFormState) => {
    if (!file) {
      throw new Error('Model file is missing');
    }
    if (!authState?.project || !authState?.authenticated || !authState?.email) {
      throw new Error('User is not authenticated');
    }
    // simulator name is chosen based on the extension of the filename
    const simulator = getSimulatorFromFileName(formMetadata.fileName);

    if (!simulator) {
      throw new Error('Invalid file type');
    }

    // User e-mail is always set to the currently logged in user, incuding for new versions
    const metadata: CreateMetadataModel | UpdateMetadataModel = {
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

      const fileInfo: FileInfoModel = {
        ...formFileInfo,
        // Override linked values from metadata
        name: metadata.modelName,
        source: simulator,
      };

      await api.modelLibrary.createModel(authState.project, {
        boundaryConditions,
        file,
        fileInfo,
        metadata,
      });
    } else {
      const { modelName, simulator, description, fileName, userEmail } =
        metadata;
      await api.modelLibrary.updateModelVersion(authState.project, {
        file,
        metadata: {
          modelName,
          simulator,
          description,
          fileName,
          userEmail,
        },
      });
    }

    history.push(`/model-library/${modelFormState.fileInfo.name}`);
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
        values: { file, fileInfo, metadata },
        setFieldValue,
        isSubmitting,
        errors,
        validateField,
      }: FormikProps<ModelFormState>) => (
        <Form>
          <InputRow>
            {file ? (
              <>
                <Field
                  as={Input}
                  title="File name"
                  name="metadata.fileName"
                  maxLength={512}
                  icon="Document"
                  validate={validateFilename}
                  fullWidth
                  error={
                    errors?.metadata?.fileName
                      ? errors.metadata.fileName
                      : undefined
                  }
                  isValid={isValidFile(metadata.fileName)}
                  helpText={
                    isValidFile(metadata.fileName)
                      ? `Simulator: ${metadata.simulator}`
                      : undefined
                  }
                  disabled
                  postfix={<Button onClick={onButtonClick}>File</Button>}
                />
              </>
            ) : (
              <Field
                as={FileInput}
                validate={validateFilename}
                extensions={acceptedFileTypes}
                onFileSelected={(file?: File) => {
                  setFieldValue('file', file);
                  setFieldValue('metadata.fileName', file?.name);
                  validateField('metadata.fileName');
                }}
              />
            )}
            <HiddenInputFile
              id="file-upload"
              type="file"
              accept={acceptedFileTypes.join(',')}
              ref={inputFile}
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
              title="Model name"
              name="metadata.modelName"
              pattern="^[A-Za-z0-9_ -]*$"
              helpText="Only alphanumeric characters, spaces ( ), underscores (_) and dashes (-) are allowed."
              maxLength={256}
              fullWidth
              disabled={!isNewModel}
              required
            />
          </InputRow>
          <InputRow>
            <Field
              as={Input}
              title="Description"
              name="metadata.description"
              maxLength={512}
              fullWidth
            />
          </InputRow>

          {!isNewModel ? (
            <InputRow>
              <Input
                value={UnitSystem[metadata.unitSystem]}
                disabled
                title="Unit system"
                fullWidth
              />
            </InputRow>
          ) : (
            <>
              <InputRow>
                <Field
                  as={Select}
                  title="Boundary conditions"
                  name="boundaryConditions"
                  onChange={(values: { label: string; value: string }[]) => {
                    setFieldValue('boundaryConditions', values);
                  }}
                  options={getSelectEntriesFromMap(BoundaryCondition)}
                  isMulti
                  required
                />
              </InputRow>
              <InputRow>
                <Field
                  as={Select}
                  title="Unit system"
                  name="metadata.unitSystem"
                  options={getSelectEntriesFromMap(UnitSystem)}
                  value={{
                    value: metadata.unitSystem,
                    label: UnitSystem[metadata.unitSystem],
                  }}
                  onChange={({ value }: { value: string }) =>
                    setFieldValue('metadata.unitSystem', value)
                  }
                  closeMenuOnSelect
                />
              </InputRow>
            </>
          )}

          {isNewModel && datasets.length > 1 && (
            <InputRow>
              <Field
                as={Select}
                title="Data set"
                name="fileInfo.dataSetId"
                value={
                  fileInfo.dataSetId && {
                    value: fileInfo.dataSetId,
                    label: formDatasets[fileInfo.dataSetId],
                  }
                }
                onChange={({ value }: { value: number }) =>
                  setFieldValue('fileInfo.dataSetId', value)
                }
                options={getSelectEntriesFromMap(formDatasets)}
                closeMenuOnSelect
              />
            </InputRow>
          )}
          <div>
            <Button
              type="primary"
              htmlType="submit"
              icon="PlusCompact"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isNewModel ? 'Create new model' : 'Upload new version'}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
