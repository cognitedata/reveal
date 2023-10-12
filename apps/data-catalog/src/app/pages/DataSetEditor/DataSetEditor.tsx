import { useEffect, useState } from 'react';

import { toast } from '@cognite/cogs.js';
import { Group } from '@cognite/sdk';

import {
  useCreateDataSetMutation,
  useDataSetOwners,
  useDataSetWithExtpipes,
  useUpdateDataSetMutation,
  useUpdateDataSetOwners,
} from '../../actions';
import { useTranslation } from '../../common/i18n';
import DataSetCreation from '../../components/DataSetCreation';
import Drawer from '../../components/Drawer';
import { useSelectedDataSet } from '../../context';
import useDebounce from '../../hooks/useDebounce';

interface DataSetEditorProps {
  visible: boolean;
  onClose(): void;
  changesSaved: boolean;
  setChangesSaved(value: boolean): void;
  sourceSuggestions?: string[];
  handleCloseModal(): void;
}

const DataSetEditor = ({
  visible,
  onClose,
  changesSaved,
  setChangesSaved,
  sourceSuggestions,
  handleCloseModal,
}: DataSetEditorProps): JSX.Element => {
  const { t } = useTranslation();
  const { selectedDataSet, setSelectedDataSet } = useSelectedDataSet();

  const { dataSetWithExtpipes, isInitialLoading: isFetchingDataSet } =
    useDataSetWithExtpipes(selectedDataSet);

  const { updateDataSet, isLoading: isUpdating } = useUpdateDataSetMutation();

  const {
    createDataSet,
    isLoading: isCreating,
    createdDataSetId,
    isSuccess: datasetCreated,
    isError: datasetCreatedError,
  } = useCreateDataSetMutation();
  const { updateOwners, isLoading: isUpdatingOwners } =
    useUpdateDataSetOwners();

  const { owners, isInitialLoading: isFetchingOwners } =
    useDataSetOwners(selectedDataSet);

  useEffect(() => {
    if (datasetCreated) {
      toast.success(t('data-set-created'));
    }
  }, [datasetCreated, t]);

  const [editedOwners, setEditedOwners] = useState<Group[]>(owners);

  const debouncedOwners = useDebounce(editedOwners, 1000);

  const loading =
    isFetchingDataSet ||
    isUpdating ||
    isCreating ||
    isFetchingOwners ||
    isUpdatingOwners;

  useEffect(() => {
    if (createdDataSetId) {
      setSelectedDataSet(createdDataSetId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdDataSetId]);

  useEffect(() => {
    setEditedOwners(owners);
  }, [owners]);

  useEffect(() => {
    if (selectedDataSet && debouncedOwners !== owners) {
      updateOwners({ owners: debouncedOwners, dataSetId: selectedDataSet });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedOwners, selectedDataSet]);

  return (
    <Drawer
      title={dataSetWithExtpipes?.dataSet?.name ?? t('create-data-set')}
      width="60%"
      visible={visible}
      onClose={onClose}
      onCancel={onClose}
      isPrimarySidebar
      hideActions
    >
      <DataSetCreation
        key={dataSetWithExtpipes?.dataSet?.id}
        loading={loading}
        createDataSet={createDataSet}
        dataSet={dataSetWithExtpipes?.dataSet}
        changesSaved={changesSaved}
        setChangesSaved={setChangesSaved}
        datasetCreated={datasetCreated}
        datasetCreatedError={datasetCreatedError}
        updateDataSet={updateDataSet}
        sourceSuggestions={sourceSuggestions}
        closeModal={handleCloseModal}
        setOwners={(value: Group[]) => {
          setEditedOwners(value);
        }}
        owners={editedOwners ?? []}
      />
    </Drawer>
  );
};

export default DataSetEditor;
