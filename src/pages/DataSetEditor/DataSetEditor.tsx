import { useEffect, useState } from 'react';

import Drawer from 'components/Drawer';
import { Group } from '@cognite/sdk';
import { DrawerHeader } from 'utils/styledComponents';
import DataSetCreation from 'components/DataSetCreation';
import useDebounce from 'hooks/useDebounce';

import { notification } from 'antd';
import {
  useCreateDataSetMutation,
  useDataSetOwners,
  useDataSetWithExtpipes,
  useUpdateDataSetMutation,
  useUpdateDataSetOwners,
} from '../../actions/index';
import { useSelectedDataSet } from '../../context/index';
import { useTranslation } from 'common/i18n';

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

  const { dataSetWithExtpipes, isLoading: isFetchingDataSet } =
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

  const { owners, isLoading: isFetchingOwners } =
    useDataSetOwners(selectedDataSet);

  useEffect(() => {
    if (datasetCreated) {
      notification.success({ message: t('data-set-created') });
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
      headerStyle={{
        background: '#4a67fb',
        color: 'white',
        fontSize: '16px',
      }}
      title={
        <DrawerHeader>
          {dataSetWithExtpipes?.dataSet?.name ?? t('create-data-set')}
        </DrawerHeader>
      }
      width="60%"
      visible={visible}
      destroyOnClose
      onClose={onClose}
      cancelHidden
      okHidden
    >
      <DataSetCreation
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
