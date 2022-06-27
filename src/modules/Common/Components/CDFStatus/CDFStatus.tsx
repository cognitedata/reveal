import { Body, Icon } from '@cognite/cogs.js';
import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { format } from 'date-fns';

export type CDFStatusModes = 'saving' | 'saved' | 'error' | 'timestamp';

interface CDFStatusType {
  mode: CDFStatusModes;
  time?: number;
}

export const CDFStatus = () => {
  const cdfStatus: CDFStatusType = useSelector(
    ({ commonReducer }: RootState) => commonReducer.saveState
  );
  const { time, mode } = cdfStatus;
  const dateTime = time ? new Date(time) : new Date();

  return (
    <>
      {mode === 'saved' && (
        <Status>
          <Icon type="Checkmark" />
          <Text level={3}>Saved to CDF</Text>
        </Status>
      )}
      {mode === 'saving' && (
        <Status>
          <Icon type="Loader" />
          <Text level={3}>Saving to CDF</Text>
        </Status>
      )}
      {mode === 'error' && (
        <Status>
          <Icon type="ErrorFilled" />
          <Text level={3}>Disconnected from CDF</Text>
        </Status>
      )}
      {mode === 'timestamp' && time && (
        <Status>
          <Icon style={{ marginTop: '6px' }} type="Upload" />
          <Text level={3}>
            {`Last Saved  ${format(dateTime, 'HH:mm')} to CDF`}
          </Text>
        </Status>
      )}
    </>
  );
};

const Status = styled.div`
  display: flex;
  color: #8c8c8c;
  align-items: center;
`;

const Text = styled(Body)`
  color: #8c8c8c;
  margin-left: 8px;
`;
