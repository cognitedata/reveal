import {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Input, OptionType, Select } from '@cognite/cogs.js';
import { FileInput } from 'components/forms/controls/FileInput';
import { CdfClientContext } from 'providers/CdfClientProvider';

import { fileInfoSlice, initialFileInfoState } from './slices';
import { InputRow } from './elements';
import { FileInfo } from './types';
import { BoundaryCondition, UnitSystem } from './constants';
import { uploadModelFile } from './utils';

interface ComponentProps {
  fileInfo?: FileInfo;
}

export function ModelForm({ fileInfo }: React.PropsWithoutRef<ComponentProps>) {
  const history = useHistory();
  const cdfClient = useContext(CdfClientContext);
  const [state, dispatch] = useReducer(
    fileInfoSlice.reducer,
    fileInfo || initialFileInfoState
  );
  const [formModelFile, setFormModelFile] = useState<File>();
  const [formBoundaryConditions, setFormBoundaryConditions] = useState<
    (OptionType<BoundaryCondition> & { value: BoundaryCondition })[]
  >([]);
  const [formDatasets, setFormDatasets] = useState<OptionType<number>[]>([]);

  async function loadData() {
    const groups = await cdfClient.groups.list();

    // Quick and dirty dataset capability lookup, this must be improved and
    // refactored along with SIM-37. NOT TYPE SAFE.
    const lookupCapabilityDatasets = (scope: string, action: string) =>
      groups
        .map((group) =>
          group.capabilities
            ?.filter((it) => `${scope}Acl` in it)
            .map((capability) => {
              const { scope, actions } = Object.values(capability)[0];
              if (actions.includes(action)) {
                return parseInt(scope.datasetScope?.ids, 10);
              }
              return null;
            })
            .flat()
        )
        .flat()
        .filter((it) => !!it);

    const availableDatasets = lookupCapabilityDatasets('files', 'WRITE');

    const datasets = (await cdfClient.datasets.list()).items
      .map(({ name, id }) => ({ label: name || 'n/a', value: id }))
      .filter(({ value }) => availableDatasets.includes(value));

    if (!datasets.length) {
      // Should be handled as an error
      return;
    }

    setFormDatasets(datasets);

    dispatch(
      fileInfoSlice.actions.updateFileInfo({
        name: 'dataSetId',
        value: datasets[0].value.toString(),
      })
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleFormSubmit(event: FormEvent) {
    event.preventDefault();

    if (!formModelFile) {
      throw new Error('File not available');
    }

    await uploadModelFile({
      cdfClient,
      file: formModelFile,
      fileInfo: state,
      boundaryConditions: formBoundaryConditions.map((it) => it.value),
    });

    history.push('/model-library');
  }

  function onFileSelected(file?: File) {
    setFormModelFile(file);
    if (!file) {
      dispatch(fileInfoSlice.actions.reset());
      return;
    }
    dispatch(
      fileInfoSlice.actions.updateMetadata({
        name: 'fileName',
        value: file.name,
      })
    );
  }

  const updateFileInfo = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) =>
    dispatch(fileInfoSlice.actions.updateFileInfo({ name, value }));

  const updateMetadata = ({
    target: { name, value },
  }: ChangeEvent<HTMLInputElement>) =>
    dispatch(fileInfoSlice.actions.updateMetadata({ name, value }));

  const getSelectEntriesFromEnum = (obj: { [key: string]: string }) =>
    Object.entries(obj).map(([value, label]) => ({
      label,
      value,
    }));

  return !state.metadata.fileName ? (
    <FileInput onFileSelected={onFileSelected} />
  ) : (
    <form onSubmit={handleFormSubmit}>
      <InputRow>
        <Input
          title="File name"
          name="fileName"
          maxLength={512}
          defaultValue={state.metadata.fileName}
          onChange={updateFileInfo}
          icon="Document"
          fullWidth
          disabled
          postfix={
            <Button onClick={() => onFileSelected()}>
              Select other file...
            </Button>
          }
        />
      </InputRow>
      <InputRow>
        <Input
          title="Model name"
          name="name"
          maxLength={256}
          defaultValue={state.name || formModelFile?.name}
          onChange={updateFileInfo}
          fullWidth
          required
        />
      </InputRow>
      <InputRow>
        <Input
          title="Description"
          name="description"
          maxLength={512}
          defaultValue={state.metadata.description}
          onChange={updateMetadata}
          fullWidth
        />
      </InputRow>
      <InputRow>
        <Select
          title="Boundary conditions"
          isMulti
          value={formBoundaryConditions}
          options={getSelectEntriesFromEnum(BoundaryCondition)}
          onChange={setFormBoundaryConditions}
        />
      </InputRow>
      <InputRow>
        <Select
          title="Unit system"
          value={{
            label: UnitSystem[state.metadata.unitSystem],
            value: state.metadata.unitSystem,
          }}
          options={getSelectEntriesFromEnum(UnitSystem)}
          onChange={({ value }: { value: string }) =>
            dispatch(
              fileInfoSlice.actions.updateMetadata({
                name: 'unitSystem',
                value,
              })
            )
          }
          closeMenuOnSelect
        />
      </InputRow>
      {formDatasets.length > 1 ? (
        <InputRow>
          <Select
            title="Data set"
            value={formDatasets[0]}
            options={formDatasets}
            onChange={({ value }: { value: number }) =>
              dispatch(
                fileInfoSlice.actions.updateFileInfo({
                  name: 'dataSetId',
                  value: value.toString(),
                })
              )
            }
            closeMenuOnSelect
          />
        </InputRow>
      ) : null}
      <div>
        <Button type="primary" htmlType="submit" icon="PlusCompact">
          Create new model
        </Button>
      </div>
    </form>
  );
}
