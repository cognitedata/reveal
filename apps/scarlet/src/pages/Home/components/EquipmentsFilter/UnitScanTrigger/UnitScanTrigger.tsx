import { useEffect, useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import {
  callScarletScanner,
  callDiagramDetection,
  getScarletScannerStatus,
  getUnitDocuments,
} from 'api';
import { useAppContext, usePolling } from 'hooks';
import { AppActionType, Facility } from 'types';

import * as Styled from './style';

const ONE_MIN = 20000;

export const UnitScanTrigger = ({
  facility,
  unitId,
}: {
  facility: Facility | undefined;
  unitId: string | undefined;
}) => {
  const { client } = useAuthContext();
  const { appDispatch } = useAppContext();
  const [scanJobId, setScanJobId] = useState<number>();

  const triggerScan = async () => {
    if (!client) return;
    if (!facility) return;
    if (!unitId) return;

    const docs = await getUnitDocuments(client, {
      facility,
      unitId,
    });
    if (!docs) return;
    docs.forEach(async (doc) => {
      callDiagramDetection(client, {
        documentId: doc.id,
      });
      const res = await callScarletScanner(client, { documentId: doc.id });
      localStorage.setItem(`scarlet_scan_jobid_${doc.id}`, `${res.jobId}`);
    });
  };

  const scanCheckCallback = async () => {
    if (!client || !scanJobId) return;
    const res = await getScarletScannerStatus(client, { jobId: scanJobId });

    if (res.status === 'Completed') {
      localStorage.removeItem(`scarlet_scan_jobid_${unitId}`);
      setScanJobId(undefined);
      appDispatch({ type: AppActionType.UPDATE_EQUIPMENT_SCANS });
    }

    if (['Failed', 'Timeout', 'Skipped'].includes(res.status)) {
      localStorage.removeItem(`scarlet_scan_jobid_${unitId}`);
      setScanJobId(undefined);
    }
  };

  usePolling(scanCheckCallback, scanJobId ? ONE_MIN : null);

  useEffect(() => {
    const jobId = localStorage?.getItem(`scarlet_scan_jobid_${unitId}`);
    if (!jobId) return;
    setScanJobId(parseInt(jobId, 10));
  }, []);

  return (
    <Styled.Container>
      <Button
        type="tertiary"
        size="default"
        aria-label="Scan All"
        onClick={triggerScan}
      >
        Scan All
      </Button>
    </Styled.Container>
  );
};
