import { useEffect } from 'react';
import { useParams } from 'react-router';
import { toast, ToastContainer } from '@cognite/cogs.js';
import { getEquipmentData } from 'scarlet/transformations';
import { StorageActionType } from 'scarlet/types';
import { useApi, useStorageDispatch } from 'scarlet/hooks';
import { DataPanelProvider } from 'scarlet/contexts';
import {
  getEquipmentDocuments,
  getEquipmentPCMS,
  getEquipmentScannerData,
} from 'scarlet/api';

import { BreadcrumbBar, PageBody, TopBar } from './components';
import * as Styled from './style';
import { mockEquipmentData } from './mocks';

export const Equipment = () => {
  const { unitName, equipmentName } =
    useParams<{ unitName: string; equipmentName: string }>();

  const scannerQuery = useApi(getEquipmentScannerData, {
    unitName,
    equipmentName,
  });
  const pcmsQuery = useApi(getEquipmentPCMS, {
    unitName,
    equipmentName,
  });
  const documentsQuery = useApi(getEquipmentDocuments, {
    unitName,
    equipmentName,
  });

  const storageDispatch = useStorageDispatch();

  useEffect(() => {
    const { data, loading, error } = scannerQuery;
    const equipmentData = getEquipmentData(data);

    if (error) {
      toast.error('Failed to load scanner data');
    }

    storageDispatch({
      type: StorageActionType.SET_EQUIPMENT,
      equipment: {
        data: mockEquipmentData(equipmentData),
        loading,
        error,
      },
    });
  }, [scannerQuery]);

  useEffect(() => {
    if (pcmsQuery.error) {
      toast.error('Failed to load pcms data');
    }

    storageDispatch({
      type: StorageActionType.SET_PCMS,
      pcms: pcmsQuery,
    });
  }, [pcmsQuery]);

  useEffect(() => {
    if (documentsQuery.error) {
      toast.error('Failed to load documents');
    }

    storageDispatch({
      type: StorageActionType.SET_DOCUMENTS,
      documents: documentsQuery,
    });
  }, [documentsQuery]);

  useEffect(
    () => () => {
      storageDispatch({
        type: StorageActionType.RESET_EQUIPMENT_DATA,
      });
    },
    []
  );

  return (
    <Styled.Container>
      <BreadcrumbBar
        unitName={unitName}
        equipmentName={equipmentName}
        pcms={pcmsQuery}
      />
      <TopBar unitName={unitName} equipmentName={equipmentName} />

      <DataPanelProvider>
        <PageBody />
      </DataPanelProvider>
      <ToastContainer position="bottom-left" />
    </Styled.Container>
  );
};
