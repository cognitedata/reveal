import { Report } from 'domain/reportManager/internal/types';
import { reportManagerAPI } from 'domain/reportManager/service/network/reportManagerAPI';

import { FC, PropsWithChildren, useRef } from 'react';

import keyBy from 'lodash/keyBy';

import { Button } from '@cognite/cogs.js';

import { getCogniteSDKClient } from '../../../utils/getCogniteSDKClient';

type Props = {
  isAdmin?: boolean;
};

export const ReportManager: FC<PropsWithChildren<Props>> = ({
  isAdmin: _isAdmin,
}) => {
  const reports = useRef<Report[]>([]);
  const client = getCogniteSDKClient();
  const createEvent = () => {
    return reportManagerAPI
      .create({
        status: 'ACTIVE',
        description: 'The NDS data was not sufficient for this wellbore',
        reason: 'Insufficient',
        reportType: 'NDS',
        startTime: Date.now(),
        externalId: 'wells/andromeda/well-AND15661828/wellbores/wb-01',
        ownerUserId: '23',
      })
      .then((result) => console.log('wow', result));
  };

  const showEvents = async () => {
    const searchedReports = await reportManagerAPI.search({});
    reports.current = searchedReports;
    console.log('wow items', keyBy(reports.current, 'externalId'));
    const statusFiltered = await reportManagerAPI.search({
      externalIds: ['wells/andromeda/well-AND15661828/wellbores/wb-01'],
      reportType: ['NDS'],
    });
    console.log('wow status filtered', statusFiltered);
  };

  const deleteEvents = async () => {
    const result = await client.events.delete(
      reports.current.map((item) => ({ id: item.id! }))
    );
    console.log('wow deleted result', result);
  };

  return (
    <div>
      <Button onClick={() => createEvent()}>Create Event</Button>
      <Button onClick={() => showEvents()}>Show Events</Button>
      <Button onClick={() => deleteEvents()}>Delete Events</Button>
    </div>
  );
};
