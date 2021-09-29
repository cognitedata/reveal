import { useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Input, Select } from '@cognite/cogs.js';
import { FileInput } from 'components/forms/controls/FileInput';
import { CdfClientContext } from 'providers/CdfClientProvider';
import { Field, Form, Formik, FormikProps } from 'formik';
import { useSelector } from 'react-redux';
import { selectDatasets } from 'store/dataset/selectors';
import { selectUploadDatasetIds } from 'store/group/selectors';

import { InputRow } from './elements';
import { ModelFormData } from './types';
import {
  BoundaryCondition,
  DEFAULT_MODEL_SOURCE,
  DEFAULT_UNIT_SYSTEM,
  UnitSystem,
} from './constants';
import { uploadModelFile } from './utils';

interface ComponentProps {
  formData?: ModelFormData;
}

const initialModelFormState: ModelFormData = {
  boundaryConditions: [],
  fileInfo: {
    name: '',
    mimeType: 'application/octet-stream',
    source: DEFAULT_MODEL_SOURCE,
    metadata: {
      dataType: '',
      description: '',
      fileName: '',
      nextVersion: '',
      previousVersion: '',
      unitSystem: DEFAULT_UNIT_SYSTEM,
      userEmail: '',
      version: '1',
    },
  },
};

const getSelectEntriesFromMap = (obj: { [key: string]: string }) =>
  Object.entries(obj).map(([value, label]) => ({
    label,
    value,
  }));

export function ModelForm({ formData }: React.PropsWithoutRef<ComponentProps>) {
  const history = useHistory();
  const cdfClient = useContext(CdfClientContext);

  const datasets = useSelector(selectDatasets);
  const scopes = useSelector(selectUploadDatasetIds);

  const formDatasets: { [key: number]: string } = datasets
    .filter((it) => scopes.includes(it.id))
    .reduce((datasets, { id, name }) => ({ ...datasets, [id]: name }), {});

  initialModelFormState.fileInfo.dataSetId = datasets[0]?.id;

  return (
    <Formik
      initialValues={formData || initialModelFormState}
      onSubmit={async (values) => {
        const { file, fileInfo } = values;
        const boundaryConditions = values.boundaryConditions.map(
          (boundaryCondition) => boundaryCondition.value
        );

        if (!file) {
          throw new Error('Model file is missing');
        }

        await uploadModelFile({
          cdfClient,
          file,
          fileInfo,
          boundaryConditions,
        });

        history.push('/model-library');
      }}
    >
      {({
        values: { fileInfo },
        setFieldValue,
        resetForm,
        isSubmitting,
      }: FormikProps<ModelFormData>) => (
        <Form>
          {!fileInfo.metadata.fileName ? (
            <Field
              as={FileInput}
              onFileSelected={(file?: File) => {
                setFieldValue('file', file);
                setFieldValue('fileInfo.metadata.fileName', file?.name);
              }}
            />
          ) : (
            <>
              <InputRow>
                <Field
                  as={Input}
                  title="File name"
                  name="fileInfo.metadata.fileName"
                  maxLength={512}
                  icon="Document"
                  fullWidth
                  disabled
                  postfix={
                    <Button onClick={() => resetForm()}>
                      Select other file...
                    </Button>
                  }
                />
              </InputRow>
              <InputRow>
                <Field
                  as={Input}
                  title="Model name"
                  name="fileInfo.name"
                  maxLength={256}
                  fullWidth
                  required
                />
              </InputRow>
              <InputRow>
                <Field
                  as={Input}
                  title="Description"
                  name="fileInfo.metadata.description"
                  maxLength={512}
                  fullWidth
                />
              </InputRow>
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
                  name="fileInfo.metadata.unitSystem"
                  options={getSelectEntriesFromMap(UnitSystem)}
                  value={{
                    value: fileInfo.metadata.unitSystem,
                    label: UnitSystem[fileInfo.metadata.unitSystem],
                  }}
                  onChange={({ value }: { value: string }) =>
                    setFieldValue('fileInfo.metadata.unitSystem', value)
                  }
                  closeMenuOnSelect
                />
              </InputRow>
              {datasets.length > 1 && (
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
                  Create new model
                </Button>
              </div>
            </>
          )}
        </Form>
      )}
    </Formik>
  );
}
