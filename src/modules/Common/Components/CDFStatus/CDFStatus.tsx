import { Icon } from '@cognite/cogs.js';
import React from 'react';

export type CDFStatusModes = 'saving' | 'saved' | 'error' | 'timestamp';

interface CDFStatusType {
  mode: CDFStatusModes;
  time: number | undefined;
}

export const CDFStatus = (cdfStatus: CDFStatusType) => {
  const { time } = cdfStatus;
  const dateTime = time ? new Date(time) : new Date();

  return (
    <>
      {cdfStatus.mode === 'saved' && (
        <>
          <div>
            <Icon style={{ marginTop: '6px' }} type="Check" />
          </div>
          <div>Saved to CDF</div>
        </>
      )}
      {cdfStatus.mode === 'saving' && (
        <>
          <div>
            <Icon style={{ marginTop: '6px' }} type="Loading" />
          </div>
          <div>Saving to CDF</div>
        </>
      )}
      {cdfStatus.mode === 'error' && (
        <>
          <div>
            <Icon style={{ marginTop: '6px' }} type="ErrorFilled" />
          </div>
          <div>Disconnected from CDF</div>
        </>
      )}
      {cdfStatus.mode === 'timestamp' && cdfStatus.time && (
        <>
          <div>
            <Icon style={{ marginTop: '6px' }} type="Upload" />
          </div>
          <div>
            Last Saved{' '}
            {String(dateTime.getHours()).length < 2
              ? `0${String(dateTime.getHours())}`
              : String(dateTime.getHours())}
            :
            {String(dateTime.getMinutes()).length < 2
              ? `0${String(dateTime.getMinutes())}`
              : String(dateTime.getMinutes())}{' '}
            to CDF
          </div>
        </>
      )}
    </>
  );
};
