import { useEffect } from 'react';
import { useParams } from 'react-router';
import { toast, ToastContainer } from '@cognite/cogs.js';
import { transformEquipmentData } from 'scarlet/transformations';
import { AppActionType } from 'scarlet/types';
import { useApi, useAppContext } from 'scarlet/hooks';
import { DataPanelProvider } from 'scarlet/contexts';
import {
  getEquipmentConfig,
  getEquipmentDocuments,
  getEquipmentPCMS,
  getEquipmentState,
  getScannerDetections,
} from 'scarlet/api';
import { getEquipmentType, getEquipmentTypeLabel } from 'scarlet/utils';

import { BreadcrumbBar, PageBody } from './components';
import * as Styled from './style';

export const Equipment = () => {
  const { unitName, equipmentName } =
    useParams<{ unitName: string; equipmentName: string }>();

  const { appState, appDispatch } = useAppContext();

  const configQuery = useApi(
    getEquipmentConfig,
    {},
    { data: appState.equipmentConfig.data }
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
  const equipmentStateQuery = useApi(getEquipmentState, {
    unitName,
    equipmentName,
  });

  useEffect(() => {
    appDispatch({
      type: AppActionType.INIT_EQUIPMENT,
      unitName,
      equipmentName,
    });

    return () => {
      appDispatch({
        type: AppActionType.CLEANUP_EQUIPMENT_DATA,
      });
    };
  }, []);

  useEffect(() => {
    const loading =
      configQuery.loading ||
      scannerDetectionsQuery.loading ||
      pcmsQuery.loading ||
      equipmentStateQuery.loading ||
      documentsQuery.loading;

    const equipmentData = loading
      ? undefined
      : transformEquipmentData({
          config: configQuery.data,
          scannerDetections: scannerDetectionsQuery.data,
          equipmentState: equipmentStateQuery.data,
          pcms: pcmsQuery.data,
          type: getEquipmentType(equipmentName),
          documents: documentsQuery.data,
        });

    appDispatch({
      type: AppActionType.SET_EQUIPMENT,
      equipment: {
        data: equipmentData,
        loading,
        error: configQuery.error,
      },
    });
  }, [
    configQuery,
    scannerDetectionsQuery,
    pcmsQuery,
    documentsQuery,
    equipmentStateQuery,
  ]);

  useEffect(() => {
    if (pcmsQuery.error) {
      toast.error('Failed to load pcms data');
    }

    appDispatch({
      type: AppActionType.SET_PCMS,
      pcms: pcmsQuery,
    });
  }, [pcmsQuery]);

  useEffect(() => {
    if (documentsQuery.error) {
      toast.error('Failed to load documents');
    }

    appDispatch({
      type: AppActionType.SET_DOCUMENTS,
      documents: documentsQuery,
    });
  }, [documentsQuery]);

  useEffect(() => {
    if (configQuery.error) {
      toast.error('Failed to load equipment configuration');
    }

    appDispatch({
      type: AppActionType.SET_EQUIPMENT_CONFIG,
      config: configQuery,
    });
  }, [configQuery]);

  useEffect(() => {
    if (scannerDetectionsQuery.error) {
      toast.error('Failed to load scanner data');
    }
  }, [scannerDetectionsQuery.error]);

  return (
    <Styled.Container>
      <BreadcrumbBar
        unitName={unitName}
        equipmentType={getEquipmentTypeLabel(getEquipmentType(equipmentName))}
      />

      <DataPanelProvider>
        <PageBody unitName={unitName} equipmentName={equipmentName} />
      </DataPanelProvider>
      <ToastContainer position="bottom-left" />
    </Styled.Container>
  );
};
