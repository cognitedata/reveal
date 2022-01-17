import { useEffect } from 'react';
import { useParams } from 'react-router';
import { toast, ToastContainer } from '@cognite/cogs.js';
import {
  transformEquipmentData,
  transformEquipmentType,
} from 'scarlet/transformations';
import { StorageActionType } from 'scarlet/types';
import { useApi, useStorage } from 'scarlet/hooks';
import { DataPanelProvider } from 'scarlet/contexts';
import {
  getEquipmentConfig,
  getEquipmentDocuments,
  getEquipmentPCMS,
  getScannerDetections,
} from 'scarlet/api';

import { BreadcrumbBar, PageBody, TopBar } from './components';
import * as Styled from './style';

export const Equipment = () => {
  const { unitName, equipmentName } =
    useParams<{ unitName: string; equipmentName: string }>();

  const { storageState, storageDispatch } = useStorage();

  const configQuery = useApi(
    getEquipmentConfig,
    {},
    { data: storageState.equipmentConfig.data }
  );

  const scannerDetectionsQuery = useApi(getScannerDetections, {
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

  useEffect(() => {
    const loading =
      configQuery.loading ||
      scannerDetectionsQuery.loading ||
      pcmsQuery.loading;

    const equipmentData = loading
      ? undefined
      : transformEquipmentData({
          config: configQuery.data,
          scannerDetections: scannerDetectionsQuery.data,
          type: transformEquipmentType(pcmsQuery.data?.equipment?.equip_group),
        });

    storageDispatch({
      type: StorageActionType.SET_EQUIPMENT,
      equipment: {
        data: equipmentData,
        loading,
        error: configQuery.error,
      },
    });
  }, [configQuery, scannerDetectionsQuery, pcmsQuery, documentsQuery]);

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

  useEffect(() => {
    if (configQuery.error) {
      toast.error('Failed to load equipment configuration');
    }

    storageDispatch({
      type: StorageActionType.SET_EQUIPMENT_CONFIG,
      config: configQuery,
    });
  }, [configQuery]);

  useEffect(() => {
    if (scannerDetectionsQuery.error) {
      toast.error('Failed to load scanner data');
    }
  }, [scannerDetectionsQuery.error]);

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
