import { Dispatch, SetStateAction } from 'react';

import styled from 'styled-components';

import { Select } from 'antd';

import { LABELING_TABLE_COLUMN_WIDTH } from '../constants';
import { ManualMatch, MatchInputOptions } from '../types';

export const ManualMatchInput = ({
  originExternalId,
  manualMatches,
  options,
  setManualMatches,
}: {
  originExternalId: string;
  manualMatches: {
    [key: string]: ManualMatch;
  };
  options: MatchInputOptions[];
  setManualMatches: Dispatch<
    SetStateAction<{
      [key: string]: ManualMatch;
    }>
  >;
}) => {
  const handleSelectedMatch = (value: string) => {
    setManualMatches((prevMatches) => ({
      ...prevMatches,
      [originExternalId]: {
        ...prevMatches[originExternalId],
        linkedExternalId: value,
      },
    }));
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCheckNoMatch = (_: any, value: string | boolean | undefined) => {
    setManualMatches((prevMatches) => ({
      ...prevMatches,
      [originExternalId]: {
        ...prevMatches[originExternalId],
        shouldNotMatch: !!value,
      },
    }));
  };

  return (
    <>
      <ManualMatchInputCell>
        <Select
          placeholder="Expected match..."
          value={manualMatches[originExternalId].linkedExternalId}
          onChange={handleSelectedMatch}
          options={options}
          showSearch
          allowClear
          style={{
            display: 'flex',
            width: '100%',
            border: '1px solid var(--cogs-border-default)',
            borderRadius: 'var(--cogs-border-radius--default)',
            transition: 'border var(--cogs-transition-time-fast) linear',
          }}
        />
      </ManualMatchInputCell>
      {/*
      This is disabled as the backend doesn't support this.
       <CheckboxContainer>
        <Tooltip content="No Match">
          <Checkbox
            checked={manualMatches[originExternalId].shouldNotMatch}
            onChange={handleCheckNoMatch}
          />
        </Tooltip>
      </CheckboxContainer> */}
    </>
  );
};

const ManualMatchInputCell = styled.div`
  width: ${LABELING_TABLE_COLUMN_WIDTH}px;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
