import { useEffect } from 'react';
import { useParams } from 'react-router';
import { toast, ToastContainer } from '@cognite/cogs.js';
import { transformEquipmentData } from 'scarlet/transformations';
import { AppActionType } from 'scarlet/types';
import { useApi, useAppContext, useFacility } from 'scarlet/hooks';
import { DataPanelProvider } from 'scarlet/contexts';
import {
  getEquipmentAnnotations,
  getEquipmentConfig,
  getEquipmentDocuments,
  getEquipmentMAL,
  getEquipmentMS,
  getEquipmentPCMS,
  getEquipmentState,
} from 'scarlet/api';
import {
  findU1Document,
  getEquipmentType,
  getEquipmentTypeLabel,
  preApproveDataElements,
} from 'scarlet/utils';

import { BreadcrumbBar, PageBody } from './components';
import * as Styled from './style';

export const Equipment = () => {
  const facility = useFacility();
  const { unitId, equipmentId } =
    useParams<{ unitId: string; equipmentId: string }>();

  const { appState, appDispatch } = useAppContext();

  const configQuery = useApi(
    getEquipmentConfig,
    {},
    { data: appState.equipmentConfig.data }
  );

  const pcmsQuery = useApi(getEquipmentPCMS, {
    facility,
    unitId,
    equipmentId,
  });
  const documentsQuery = useApi(getEquipmentDocuments, {
    unitId,
    equipmentId,
  });
  const equipmentStateQuery = useApi(getEquipmentState, {
    facility,
    unitId,
    equipmentId,
  });
  const malQuery = useApi(getEquipmentMAL, {
    facility,
    unitId,
    equipmentId,
  });
  const msQuery = useApi(getEquipmentMS, {
    facility,
    unitId,
    equipmentId,
  });

  const scannerDetectionsQuery = useApi(
    getEquipmentAnnotations,
    { config: configQuery.data, documents: documentsQuery.data },
    { skip: !configQuery.data || !documentsQuery.data }
  );

  useEffect(() => {
    appDispatch({
      type: AppActionType.INIT_EQUIPMENT,
      facility: facility!,
      unitId,
      equipmentId,
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
      malQuery.loading ||
      msQuery.loading ||
      equipmentStateQuery.loading;

    const error =
      configQuery.error || equipmentStateQuery.error || pcmsQuery.error;

    const equipmentData =
      loading || error
        ? undefined
        : transformEquipmentData({
            config: configQuery.data!,
            scannerDetections: scannerDetectionsQuery.data,
            equipmentState: equipmentStateQuery.data,
            pcms: pcmsQuery.data!,
            mal: malQuery.data,
            ms: msQuery.data,
            type: getEquipmentType(equipmentId),
          });

    const hasU1Document = Boolean(findU1Document(documentsQuery.data));

    const hasChanged = equipmentData
      ? preApproveDataElements(equipmentData, hasU1Document, unitId)
      : false;

    appDispatch({
      type: AppActionType.SET_EQUIPMENT,
      equipment: {
        data: equipmentData,
        loading,
        error,
      },
      isAutoSave: hasChanged,
    });
  }, [
    configQuery,
    scannerDetectionsQuery,
    pcmsQuery,
    malQuery,
    msQuery,
    documentsQuery,
    equipmentStateQuery,
  ]);

  useEffect(() => {
    if (pcmsQuery.error) {
      toast.error('Failed to load pcms data');
    }
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

  if (!facility) return null;

  return (
    <Styled.Container>
      <BreadcrumbBar
        unitId={unitId}
        equipmentType={getEquipmentTypeLabel(getEquipmentType(equipmentId))}
      />

      <DataPanelProvider>
        <PageBody unitId={unitId} equipmentId={equipmentId} />
      </DataPanelProvider>
      <ToastContainer position="bottom-left" />
    </Styled.Container>
  );
};
