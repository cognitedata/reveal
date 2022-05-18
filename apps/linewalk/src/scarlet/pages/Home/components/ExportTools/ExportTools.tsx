import { useEffect, useState } from 'react';
import {
  useApi,
  useCognitePlaygroundClient,
  useHomePageContext,
  usePoolExportFileId,
} from 'scarlet/hooks';
import { HomePageActionType } from 'scarlet/types';
import { callEquipmentExportFunction, getExportFile } from 'scarlet/api';
import { FunctionCall } from '@cognite/sdk-playground';

import { ExportModal, ExportStatusModal } from '..';

export const ExportTools = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalRendered, setIsModalRendered] = useState(false);

  const [isStatusModalRendered, setIsStatusModalRendered] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const { homePageState, homePageDispatch } = useHomePageContext();
  const { exportEquipmentsModal } = homePageState;
  const cognitePlaygroundClient = useCognitePlaygroundClient();
  const [functionCall, setFunctionCall] = useState<FunctionCall>();
  const [error, setError] = useState<any>();
  const [retryCallback, setRetryCallback] = useState<() => void>();

  const exportFileIdQuery = usePoolExportFileId(
    cognitePlaygroundClient,
    functionCall
  );
  const exportFileQuery = useApi(getExportFile, {
    id: exportFileIdQuery.fileId,
  });

  const onClose = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setIsModalRendered(false);
      homePageDispatch({
        type: HomePageActionType.CLOSE_EXPORT_EQUIPMENTS,
      });
    }, 300);
  };

  const onCloseStatusModal = () => {
    setIsStatusModalVisible(false);
    setTimeout(() => {
      setIsStatusModalRendered(false);
    }, 300);
    setRetryCallback(undefined);

    homePageDispatch({
      type: HomePageActionType.CLOSE_EXPORT_EQUIPMENTS,
    });
  };

  const onExport = (equipmentIds: string[]) => {
    const { facility, unitId } = homePageState;
    setIsStatusModalVisible(true);
    setIsStatusModalRendered(true);
    setIsModalRendered(false);
    setFunctionCall(undefined);
    setError(undefined);
    setRetryCallback(() => () => onExport(equipmentIds));
    callEquipmentExportFunction(cognitePlaygroundClient, {
      facility,
      unitId,
      equipmentIds,
    })
      .then((functionCall) => {
        setFunctionCall(functionCall);
      })
      .catch(setError);
  };

  useEffect(() => {
    if (exportFileIdQuery.error) setError(exportFileIdQuery.error);
  }, [exportFileIdQuery]);

  useEffect(() => {
    if (exportFileQuery.data?.downloadUrl) {
      setIsStatusModalRendered(false);
      homePageDispatch({
        type: HomePageActionType.CLOSE_EXPORT_EQUIPMENTS,
      });
      window.location.href = exportFileQuery.data?.downloadUrl;
    } else if (exportFileIdQuery.fileId && exportFileQuery.error) {
      setError(exportFileQuery);
    }
  }, [exportFileQuery]);

  useEffect(() => {
    if (exportEquipmentsModal) {
      setIsModalVisible(true);
      setIsModalRendered(true);
    }
  }, [homePageState.exportEquipmentsModal]);

  return (
    <>
      {isModalRendered && (
        <ExportModal
          visible={isModalVisible}
          onClose={onClose}
          onExport={onExport}
        />
      )}
      {isStatusModalRendered && (
        <ExportStatusModal
          visible={isStatusModalVisible}
          onClose={onCloseStatusModal}
          error={error}
          retry={retryCallback}
        />
      )}
    </>
  );
};
