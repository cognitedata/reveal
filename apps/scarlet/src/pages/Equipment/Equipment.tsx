import { useEffect } from 'react';
import { useParams } from 'react-router';
import { toast, ToastContainer } from '@cognite/cogs.js';
import { transformEquipmentData } from 'transformations';
import { AppActionType } from 'types';
import { useApi, useAppContext, useFacility } from 'hooks';
import { DataPanelProvider } from 'contexts';
import {
  getEquipmentAnnotations,
  getEquipmentConfig,
  getEquipmentDocuments,
  getEquipmentMAL,
  getEquipmentMS,
  getEquipmentPCMS,
  getEquipmentState,
} from 'api';
import { getEquipmentType } from 'utils';

import { PageBody, ActionToastBody } from './components';
import * as Styled from './style';

export const Equipment = () => {
  const facility = useFacility();
  const { unitId, equipmentId } = useParams<{
    unitId: string;
    equipmentId: string;
  }>();

  const { appState, appDispatch } = useAppContext();

  const { state: configQuery } = useApi(
    getEquipmentConfig,
    {},
    { data: appState.equipmentConfig.data }
  );

  const { state: pcmsQuery } = useApi(getEquipmentPCMS, {
    facility,
    unitId,
    equipmentId,
  });
  const { state: documentsQuery, trigger: documentsQueryTrigger } = useApi(
    getEquipmentDocuments,
    {
      unitId,
      equipmentId,
    }
  );
  const { state: equipmentStateQuery } = useApi(getEquipmentState, {
    facility,
    unitId,
    equipmentId,
  });
  const { state: malQuery } = useApi(getEquipmentMAL, {
    facility,
    unitId,
    equipmentId,
  });
  const { state: msQuery } = useApi(getEquipmentMS, {
    facility,
    unitId,
    equipmentId,
  });

  const { state: scannerDetectionsQuery } = useApi(
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

    appDispatch({
      type: AppActionType.SET_EQUIPMENT,
      equipment: {
        data: equipmentData,
        loading,
        error,
      },
      isInitial: true,
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
      toast.open(
        (props) => (
          <ActionToastBody toastProps={props} action={documentsQueryTrigger} />
        ),
        {
          className: 'cogs-toast-error',
          autoClose: false,
        }
      );
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
      <DataPanelProvider>
        <PageBody unitId={unitId} equipmentId={equipmentId} />
      </DataPanelProvider>
      <ToastContainer position="bottom-left" />
    </Styled.Container>
  );
};
