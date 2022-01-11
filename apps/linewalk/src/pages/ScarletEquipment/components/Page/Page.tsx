import { useEffect } from 'react';
import { useParams } from 'react-router';
import { toast, ToastContainer } from '@cognite/cogs.js';

import { getDocumentsData, getPCMSData, getScannerData } from '../../api';
import { DataPanelProvider } from '../../contexts';
import { BreadcrumbBar, ScarletBody, TopBar } from '../../components';
import { useApi, useStorageDispatch } from '../../hooks';
import { StorageActionType } from '../../types';

import * as Styled from './style';

export const Page = () => {
  const { unitName, equipmentName } =
    useParams<{ unitName: string; equipmentName: string }>();

  const scannerQuery = useApi(getScannerData, unitName, equipmentName);
  const pcmsQuery = useApi(getPCMSData, unitName, equipmentName);
  const documentsQuery = useApi(getDocumentsData, unitName, equipmentName);

  const storageDispatch = useStorageDispatch();

  useEffect(() => {
    if (scannerQuery.error) {
      toast.error('Failed to load scanner data');
    }

    storageDispatch({
      type: StorageActionType.SET_PCMS,
      pcms: pcmsQuery,
    });
  }, [pcmsQuery]);

  useEffect(() => {
    if (scannerQuery.error) {
      toast.error('Failed to load scanner data');
    }

    storageDispatch({
      type: StorageActionType.SET_DOCUMENTS,
      documents: documentsQuery,
    });
  }, [pcmsQuery]);

  useEffect(() => {
    if (scannerQuery.error) {
      toast.error('Failed to load scanner data');
    }

    storageDispatch({
      type: StorageActionType.SET_SCANNER,
      scanner: scannerQuery,
    });
  }, [scannerQuery]);

  return (
    <Styled.Container>
      <BreadcrumbBar unitName={unitName} equipmentName={equipmentName} />
      <TopBar equipmentName={equipmentName} />

      <DataPanelProvider>
        <ScarletBody />
      </DataPanelProvider>
      <ToastContainer position="bottom-left" />
    </Styled.Container>
  );
};
