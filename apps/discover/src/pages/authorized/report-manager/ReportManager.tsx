import { Report } from 'domain/reportManager/internal/types';
import { reportManagerAPI } from 'domain/reportManager/service/network/reportManagerAPI';

import { FC, PropsWithChildren, useRef } from 'react';

import { Button } from '@cognite/cogs.js';

type Props = {
  isAdmin?: boolean;
};

export const ReportManager: FC<PropsWithChildren<Props>> = ({
  isAdmin: _isAdmin,
}) => {
  const reports = useRef<Report[]>([]);
  const createReports = () => {
    return reportManagerAPI.create({
      status: 'ACTIVE',
      description: 'The NDS data was not sufficient for this wellbore',
      reason: 'Insufficient',
      reportType: 'NDS',
      startTime: Date.now(),
      externalId: 'wells/andromeda/well-AND15661828/wellbores/wb-01',
      ownerUserId: '23',
    });
  };

  const showReports = async () => {
    const searchedReports = await reportManagerAPI.search({});
    reports.current = searchedReports;
  };

  const deleteReports = async () => {
    await reportManagerAPI.delete(reports.current.map((item) => item.id!));
  };

  const updateReports = async () => {
    await reportManagerAPI.update(reports.current[0].id!, {
      status: 'IN_PROGRESS',
    });
  };

  return (
    <div>
      <Button onClick={() => createReports()}>Create Reports</Button>
      <Button onClick={() => showReports()}>Show Reports</Button>
      <Button onClick={() => deleteReports()}>Delete Reports</Button>
      <Button onClick={() => updateReports()}>Update Reports</Button>
    </div>
  );
};
