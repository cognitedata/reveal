import { useEffect, useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import {
  callDiagramDetection,
  callScarletScanner,
  getScarletScannerStatus,
  clearEquipmentState,
} from 'api';
import { useAppContext, usePolling } from 'hooks';
import { AppActionType } from 'types';

import * as Styled from './style';

const ONE_MIN = 20000;

export const DocumentScanTrigger = ({ documentId }: { documentId: number }) => {
  const { client } = useAuthContext();
  const {
    appState: { facility, unitId, equipment, equipmentId },
    appDispatch,
  } = useAppContext();
  const [scanJobId, setScanJobId] = useState<number>();

  const triggerRescan = async () => {
    if (!client) return;
    if (!facility) return;
    if (!unitId) return;
    if (!equipmentId) return;
    clearEquipmentState(client, {
      facility,
      unitId,
      equipmentId,
    });
    await triggerScan();
  };

  const triggerScan = async () => {
    if (!client) return;
    const jobId = localStorage.getItem(`scarlet_scan_jobid_${documentId}`);
    if (jobId) return;

    callDiagramDetection(client, { documentId });
    const res = await callScarletScanner(client, { documentId });
    localStorage.setItem(`scarlet_scan_jobid_${documentId}`, `${res.jobId}`);
    setScanJobId(res.jobId);
  };

  const scanCheckCallback = async () => {
    if (!client || !scanJobId) return;
    const res = await getScarletScannerStatus(client, { jobId: scanJobId });

    if (res.status === 'Completed') {
      localStorage.removeItem(`scarlet_scan_jobid_${documentId}`);
      setScanJobId(undefined);
      appDispatch({ type: AppActionType.UPDATE_EQUIPMENT_SCANS });
    }

    if (['Failed', 'Timeout', 'Skipped'].includes(res.status)) {
      localStorage.removeItem(`scarlet_scan_jobid_${documentId}`);
      setScanJobId(undefined);
    }
  };

  usePolling(scanCheckCallback, scanJobId ? ONE_MIN : null);

  useEffect(() => {
    const jobId = localStorage?.getItem(`scarlet_scan_jobid_${documentId}`);
    if (!jobId) return;
    setScanJobId(parseInt(jobId, 10));
  }, []);

  // if (equipment.data?.latestAnnotations) return null;

  return (
    <Styled.Container contained={!!scanJobId}>
      {!!scanJobId && <Styled.Label>scan pending</Styled.Label>}
      <Button
        type="tertiary"
        size="default"
        aria-label="Scan Document"
        onClick={triggerRescan}
        disabled={!!scanJobId}
      >
        {equipment.data?.latestAnnotations ? 'Re-scan' : 'Scan'} Document
      </Button>
    </Styled.Container>
  );
};
